import { logger } from '../logger';
import { DatabaseAdapter } from '../database/adapter';
import { DownloadDesc, DownloadTaskStatus } from '../database/entity/download_task';
import { ChapterAccessor } from '../library/accessor.chapter';
import { MangaAccessor } from '../library/accessor.manga';
import { ProviderAdapter } from '../provider/providers/adapter';

export class AsyncTaskCancelError extends Error {
  constructor() {
    super();
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = 'Async task is cancelled.';
  }
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
  await accessor.updateMetadata(detail.metadata);

  if (detail.thumb !== undefined) {
    const thumb = await provider.requestImage(detail.thumb);
    cancelIfNeed();
    await accessor.updateThumb(thumb);
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

  let hasImageError = false;
  const imageTasks = imageUrls.map((url) => () => provider.requestImage(url));

  for (const [i, task] of imageTasks.entries()) {
    const imageFilename = `${i}.jpg`;
    if (await accessor.isImageExist(imageFilename)) continue;

    await task()
      .catch((e) => {
        logger.error(`Image error at: ${provider.name}:${chapterId}:${i}`);
        logger.error(`Image error: ${e.stack}`);
        hasImageError = true;
      })
      .then((image) => {
        cancelIfNeed();
        if (image != undefined) return accessor.writeImage(imageFilename, image);
      });
  }
  return hasImageError;
}

export class DownloadTask {
  private isCancelled: boolean = false;

  constructor(
    private readonly db: DatabaseAdapter,
    private readonly mangaAccessor: MangaAccessor,
    private readonly provider: ProviderAdapter,
    private readonly desc: DownloadDesc
  ) {}

  async run() {
    const detail = await downloadMangaDetail(
      this.provider,
      this.mangaAccessor,
      this.desc.sourceManga,
      this.cancelIfNeed
    );

    let hasChapterError = false;

    for (const collection of detail.collections) {
      for (const chapter of collection.chapters) {
        if (await this.isChapterCompleted(chapter.id)) continue;

        const collectionId = collection.id;
        const chapterId = `${chapter.name} ${chapter.title}`;
        const chapterAccessor = await this.createChapter(collectionId, chapterId);

        const hasImageError = await downloadChapter(
          this.provider,
          chapterAccessor,
          detail.id,
          chapter.id,
          this.cancelIfNeed
        );

        if (hasImageError) hasChapterError = true;
        else await this.markChapterCompleted(chapter.id);
      }
    }

    if (hasChapterError) {
      this.desc.status = DownloadTaskStatus.Error;
      await this.db.downloadTaskRepository.save(this.desc);
    } else {
      if (!this.desc.isCreatedBySubscription)
        await this.db.downloadChapterRepository.delete({ task: this.desc.id });
      await this.db.downloadTaskRepository.remove(this.desc);
    }
  }

  cancel(mangaId: string): void {
    if (this.desc.id === mangaId) this.isCancelled = true;
  }

  private isChapterCompleted(chapterId: string) {
    this.cancelIfNeed();
    return this.db.downloadChapterRepository
      .findOne({
        where: {
          task: this.desc.id,
          chapter: chapterId,
        },
      })
      .then((task) => task !== undefined);
  }

  private markChapterCompleted(chapterId: string) {
    this.cancelIfNeed();
    return this.db.downloadChapterRepository.insert({
      task: this.desc.id,
      chapter: chapterId,
    });
  }

  private createChapter(collectionId: string, chapterId: string) {
    this.cancelIfNeed();
    return this.mangaAccessor.createChapter(collectionId, chapterId).then((result) =>
      result.whenFail(() => {
        throw Error('Chapter not exist');
      })
    );
  }

  private cancelIfNeed() {
    if (this.isCancelled) throw new AsyncTaskCancelError();
  }
}
