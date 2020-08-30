import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';

import { logger } from '../logger';
import { DatabaseAdapter } from '../db/db_adapter';
import { DownloadTask, DownloadTaskStatus } from '../db/entity/download_task';
import { AccessorLibrary } from '../library/accessor.library';

import { ProviderService } from './service.provider';
import { ProviderAdapter } from '../provider/provider_adapter';
import { AccessorChapter } from '../library/accessor.chapter';

class AsyncTaskCancelError extends Error {
  constructor() {
    super();
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = 'Async task is cancelled.';
  }
}

export class DownloadService {
  constructor(
    private readonly db: DatabaseAdapter,
    private readonly library: AccessorLibrary,
    private readonly providerService: ProviderService
  ) {}

  private isRunning = false;
  private isCancelled = false;
  private currentDownloadManga: string | undefined = undefined;

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.downloadLoop().then(() => (this.isRunning = false));
  }

  cancelCurrentTask(): void {
    this.isCancelled = true;
  }

  isMangaDownloading(mangaId: string): boolean {
    return mangaId === this.currentDownloadManga;
  }

  private cancelIfNeed() {
    if (this.isCancelled) throw new AsyncTaskCancelError();
  }

  private async downloadLoop() {
    while (true) {
      //TODO: order by update timestamp
      const task = await this.db.downloadTaskRepository.findOne({
        where: { status: DownloadTaskStatus.Waiting },
      });
      if (task === undefined) break;

      try {
        logger.info(`Download: ${task.source}/${task.sourceManga} -> ${task.targetManga}`);
        this.currentDownloadManga = task.targetManga;

        task.status = DownloadTaskStatus.Downloading;
        await this.db.downloadTaskRepository.save(task);

        await this.downloadManga(task);
      } catch (error) {
        if (error instanceof AsyncTaskCancelError) {
          logger.info(`Download is canceled`);
        } else {
          logger.error(`Download error: ${error.stack}`);
          task.status = DownloadTaskStatus.Error;
          await this.db.downloadTaskRepository.save(task);
        }
      } finally {
        this.isCancelled = false;
        this.currentDownloadManga = undefined;
      }
    }
  }

  private async downloadManga(task: DownloadTask) {
    await this.library.createManga(task.targetManga);

    const provider = this.providerService.getProvider(task.source);
    if (provider === undefined) throw Error('Provider not exist');
    const detail = await provider.requestMangaDetail(task.sourceManga);
    this.cancelIfNeed();

    const mangaAccessor = await this.library.openManga(task.targetManga);

    let thumb = undefined;
    if (detail.thumb !== undefined) thumb = await provider.requestImage(detail.thumb);
    await mangaAccessor!.updateMangaDetail(detail, thumb);

    let hasChapterError = false;
    for (const collection of detail.collections) {
      for (const chapter of collection.chapters) {
        const chapterTask = await this.db.downloadChapterRepository.findOne({
          where: {
            task: task.id,
            chapter: chapter.id,
          },
        });

        if (chapterTask !== undefined) continue;
        const chapterId = `${chapter.name} ${chapter.title}`;
        const chapterAccessor = await mangaAccessor!.openChapter(collection.id, chapterId);
        const isChapterError = await this.downloadChapter(provider, chapterAccessor!, chapter.id);

        if (isChapterError) hasChapterError = true;
        else {
          await this.db.downloadChapterRepository.create({
            task: task.id,
            chapter: chapter.id,
          });
        }
      }
    }

    if (hasChapterError) {
      task.status = DownloadTaskStatus.Error;
      await this.db.downloadTaskRepository.save(task);
    } else {
      if (!task.isCreatedBySubscription)
        await this.db.downloadChapterRepository.delete({ task: task.id });
      await this.db.downloadTaskRepository.remove(task);
    }
  }

  private async downloadChapter(
    provider: ProviderAdapter,
    accessor: AccessorChapter,
    chapter: string
  ) {
    logger.info(`Download chapter: chapter:${chapter}`);
    const imageUrls = await provider.requestChapterContent(chapter);
    this.cancelIfNeed();

    let hasImageError = false;
    for (const [i, url] of imageUrls.entries()) {
      const imageFilename = `${i}.jpg`;
      if (await accessor.isImageExist(imageFilename)) continue;

      try {
        const data = await provider.requestImage(url);
        await accessor.writeImage(imageFilename, data);
      } catch (error) {
        logger.error(`Image error at: ${provider.name}:${chapter}:${i}`);
        logger.error(`Image error: ${error.stack}`);
        hasImageError = true;
      }
      this.cancelIfNeed();
    }
    return hasImageError;
  }
}
