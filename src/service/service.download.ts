import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';

import { logger } from '../logger';
import { DatabaseAdapter } from '../db/db_adapter';
import { DownloadTask, DownloadTaskStatus } from '../db/entity/download_task';
import { Collection, MetadataDetail } from '../entity/manga_detail';
import { LibraryAdapter } from '../library/adapter';
import * as fsu from '../util/fs';

import { ProviderService } from './service.provider';
import { ProviderAdapter } from '../provider/provider_adapter';
import { DownloadChapterTask } from '../db/entity/download_chapter_task';

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
    private readonly library: LibraryAdapter,
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
      await this.downloadManga(task);
    }
  }

  async downloadManga(task: DownloadTask) {
    try {
      logger.info(`Download: ` + `${task.source}/${task.sourceManga} -> ` + `${task.targetManga}`);
      this.currentDownloadManga = task.targetManga;

      task.status = DownloadTaskStatus.Downloading;
      await this.db.downloadTaskRepository.save(task);
      this.cancelIfNeed();

      await this.library.createManga(task.targetManga);
      //   const mangaDir = path.join(libraryDir, task.targetManga);

      const provider = this.providerService.getProvider(task.source);
      if (provider === undefined) throw Error('Provider not exist');
      const detail = await provider.requestMangaDetail(task.sourceManga);
      this.cancelIfNeed();

      const mangaDir = path.join(this.library.libraryDir, task.targetManga);
      if (detail.thumb !== undefined) await this.downloadThumb(mangaDir, detail.thumb, provider);
      await this.downloadMetadata(mangaDir, detail.metadata);
      await this.downloadContent(mangaDir, detail.collections, provider, task);

      const isCompleted = await this.db.downloadChapterTaskRepository
        .count({
          where: {
            targetManga: task.targetManga,
            isCompleted: false,
          },
        })
        .then((count) => {
          if (count != 0) return false;
          return true;
        });

      if (isCompleted) {
        if (!task.isCreatedBySubscription) {
          this.db.downloadChapterTaskRepository.delete({
            targetManga: task.targetManga,
          });
        }
        await this.db.downloadTaskRepository.remove(task);
      } else {
        task.status = DownloadTaskStatus.Error;
        await this.db.downloadTaskRepository.save(task);
      }
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

  async downloadMetadata(mangaDir: string, metadata: MetadataDetail) {
    const metadataPath = path.join(mangaDir, 'metadata.json');
    if (!(await fsu.isFileExist(metadataPath))) {
      await fsp.writeFile(metadataPath, JSON.stringify(metadata));
    }
  }

  async downloadThumb(mangaDir: string, thumb: string, provider: ProviderAdapter) {
    const thumbPath = path.join(mangaDir, 'thumb.jpg');
    if (!(await fsu.isFileExist(thumbPath))) {
      const stream = await fs.createWriteStream(thumbPath);
      await provider.requestImage(thumb, stream);
    }
    this.cancelIfNeed();
  }

  async refreshModifiedTime(mangaDir: string) {
    const tempPath = path.join(mangaDir, 'temp.json');
    await fsp.open(tempPath, 'w').then((f) => f.close());
    await fs.unlinkSync(tempPath);
  }

  async downloadContent(
    mangaDir: string,
    collections: Collection[],
    provider: ProviderAdapter,
    task: DownloadTask
  ) {
    for (const collection of collections) {
      const collectionDir = path.join(mangaDir, collection.id);
      if (!(await fsu.isDirectoryExist(collectionDir))) await fsp.mkdir(collectionDir);

      for (const chapter of collection.chapters) {
        let chapterTask = await this.db.downloadChapterTaskRepository.findOne({
          where: {
            source: task.source,
            sourceChapter: chapter.id,
            targetManga: task.targetManga,
            targetCollection: collection.id,
            targetChapter: `${chapter.name} ${chapter.title}`,
          },
        });

        if (chapterTask === undefined) {
          chapterTask = await this.db.downloadChapterTaskRepository.create({
            source: task.source,
            sourceChapter: chapter.id,
            targetManga: task.targetManga,
            targetCollection: collection.id,
            targetChapter: `${chapter.name} ${chapter.title}`,
          });
        }
        this.cancelIfNeed();

        if (!chapterTask.isCompleted) {
          try {
            await this.downloadChapter(provider, chapterTask);
            await this.refreshModifiedTime(mangaDir);
          } catch (error) {}
          this.cancelIfNeed();
        }
      }
    }
  }

  async downloadChapter(provider: ProviderAdapter, chapterTask: DownloadChapterTask) {
    logger.info(
      `Download chapter: ` +
        `manga:${chapterTask.targetManga} ` +
        `chapter:${chapterTask.targetChapter} `
    );
    const imageUrls = await provider.requestChapterContent(chapterTask.sourceChapter);
    this.cancelIfNeed();

    const chapterDir = path.join(
      this.library.libraryDir,
      chapterTask.targetManga,
      chapterTask.targetCollection,
      chapterTask.targetChapter
    );
    if (!(await fsu.isDirectoryExist(chapterDir))) await fsp.mkdir(chapterDir);

    let isChapterError = false;
    for (const [i, url] of imageUrls.entries()) {
      const imagePath = path.join(chapterDir, `${i}.jpg`);
      if (!fs.existsSync(imagePath)) {
        let isImageError = false;
        try {
          const stream = fs.createWriteStream(imagePath);
          await provider.requestImage(url, stream);
        } catch (error) {
          logger.error(
            `Image error at: ` +
              `manga:${chapterTask.targetManga} ` +
              `chapter:${chapterTask.targetChapter} ` +
              `image:${i} `
          );
          logger.error(`Image error: ${error.stack}`);
          fs.unlinkSync(imagePath);
          isImageError = true;
        }
        this.cancelIfNeed();
        if (isImageError) {
          isChapterError = true;
        }
      }
    }

    if (!isChapterError) {
      chapterTask.isCompleted = true;
      await this.db.downloadChapterTaskRepository.save(chapterTask);
    }
  }
}
