import { MangaStatus } from '@data';
import { logger } from '@logger';
import { ChapterAccessor } from '@library/accessor.chapter';
import { MangaAccessor } from '@library/accessor.manga';
import { ProviderAdapter } from '@provider/adapter';
import settings from '@settings';
import { pool } from '@util/async/async_pool';
import { getBasename } from '@util/fs';

export class AsyncTaskCancelError extends Error {
  constructor() {
    super();
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = 'Async task is cancelled.';
  }
}

export interface DownloadResult {
  isAllUpdated: boolean;
  isCompleted: boolean;
}

export interface DownloadTask {
  mangaId: string;
  promise: Promise<DownloadResult>;
  cancel: (id: string) => void;
}

export function download(
  provider: ProviderAdapter,
  accessor: MangaAccessor,
  mangaId: string
): DownloadTask {
  let isCancelled = false;

  const cancel = (id: string) => {
    if (mangaId === id) isCancelled = true;
  };
  const cancelIfNeed = () => {
    if (isCancelled) throw new AsyncTaskCancelError();
  };

  return {
    mangaId,
    promise: downloadManga(provider, accessor, mangaId, cancelIfNeed),
    cancel,
  };
}

async function downloadManga(
  provider: ProviderAdapter,
  accessor: MangaAccessor,
  mangaId: string,
  cancelIfNeed: () => void
) {
  async function openChapter(collectionId: string, chapterId: string) {
    cancelIfNeed();
    const chapterAccessor = await accessor.getOrCreateChapter(
      collectionId,
      chapterId
    );
    if (chapterAccessor === undefined) throw new Error('uncompatible chapter');
    return chapterAccessor;
  }

  logger.info(`Download: ${provider.id}/${mangaId} -> ${accessor.id}`);

  const detail = await downloadMangaDetail(
    provider,
    accessor,
    mangaId,
    cancelIfNeed
  );

  let hasChapterError = false;
  for (const collection of detail.collections) {
    for (const chapter of collection.chapters) {
      const collectionId = collection.id;
      const chapterId = `${chapter.name} ${chapter.title}`;

      const chapterAccessor = await openChapter(collectionId, chapterId);
      if (!(await chapterAccessor.hasUncompleteMark())) continue;

      const hasImageError = await downloadChapter(
        provider,
        chapterAccessor,
        detail.id,
        chapter.id,
        cancelIfNeed
      );

      if (hasImageError) hasChapterError = true;
      else {
        await chapterAccessor.removeUncompleteMark();
        await accessor.refreshUpdateTime();
        await accessor.addNewMark();
      }
    }
  }
  return {
    isAllUpdated: !hasChapterError,
    isCompleted: detail.metadata.status == MangaStatus.Completed,
  };
}

async function downloadMangaDetail(
  provider: ProviderAdapter,
  accessor: MangaAccessor,
  mangaId: string,
  cancelIfNeed: () => void
) {
  logger.info(`Download manga detail: ${mangaId}`);
  const detail = await provider.requestMangaDetail(mangaId);
  cancelIfNeed();
  await accessor.setMetadata(detail.metadata);

  if (detail.thumb !== undefined) {
    const thumb = await provider.requestImage(detail.thumb);
    cancelIfNeed();
    await accessor.setThumb(thumb);
  }

  return detail;
}

async function downloadChapter(
  provider: ProviderAdapter,
  accessor: ChapterAccessor,
  mangaId: string,
  chapterId: string,
  cancelIfNeed: () => void
) {
  logger.info(`Download chapter: ${mangaId}/${chapterId}`);
  const imageUrls = await provider.requestChapterContent(mangaId, chapterId);
  cancelIfNeed();

  const existImages = (await accessor.listImage()).map(getBasename);
  const tasks = imageUrls
    .map((url, index) => ({ filename: index.toString(), url }))
    .filter((it) => !existImages.includes(it.filename))
    .map(
      (it) => () =>
        provider
          .requestImage(it.url)
          .then((image) => accessor.writeImage(it.filename, image))
    );

  const concurrent = settings.downloadConcurrent;
  let hasImageError = false;
  for await (const it of pool(tasks, concurrent)) {
    cancelIfNeed();
    if (!it.isValue) {
      logger.error(`Image error at: ${provider.name}:${chapterId}:${it.index}`);
      logger.error(`Image error: ${it.error}`);
      hasImageError = true;
    }
  }
  return hasImageError;
}
