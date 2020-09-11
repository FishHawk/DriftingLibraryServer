import { logger } from '../logger';
import { DatabaseAdapter } from '../database/db_adapter';
import { DownloadTask, DownloadTaskStatus } from '../database/entity/download_task';

import { ProviderAdapter } from '../provider/adapter';
import { ProviderManager } from '../provider/manager';

import { AccessorLibrary } from '../library/accessor.library';
import { AccessorManga } from '../library/accessor.manga';
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
    private readonly providerManager: ProviderManager
  ) {}

  private isRunning = false;
  private isCancelled = false;
  private currentTaskId: number | undefined = undefined;

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.downloadLoop().then(() => (this.isRunning = false));
  }

  cancelTask(id: number): void {
    if (this.currentTaskId === id) this.isCancelled = true;
  }

  async getAllDownloadTask() {
    return this.db.downloadTaskRepository.find();
  }

  async startAllDownloadTask() {
    await this.db.downloadTaskRepository.update(
      { status: DownloadTaskStatus.Paused },
      { status: DownloadTaskStatus.Waiting }
    );

    await this.db.downloadTaskRepository.update(
      { status: DownloadTaskStatus.Error },
      { status: DownloadTaskStatus.Waiting }
    );
    this.start();
  }

  async pauseAllDownloadTask() {
    await this.db.downloadTaskRepository.update(
      { status: DownloadTaskStatus.Waiting },
      { status: DownloadTaskStatus.Paused }
    );

    await this.db.downloadTaskRepository.update(
      { status: DownloadTaskStatus.Downloading },
      { status: DownloadTaskStatus.Paused }
    );
  }

  async createDownloadTask(
    providerId: string,
    sourceManga: string,
    targetManga: string,
    isCreatedBySubscription: boolean = false
  ) {
    if (await this.library.isMangaExist(targetManga)) return undefined;
    await this.library.createManga(targetManga);

    const task = this.db.downloadTaskRepository.create({
      providerId,
      sourceManga,
      targetManga,
      isCreatedBySubscription,
    });
    await this.db.downloadTaskRepository.save(task);
    this.start();
    return task;
  }

  async deleteDownloadTask(id: number) {
    const task = await this.db.downloadTaskRepository.findOne(id);
    if (task !== undefined) {
      this.cancelTask(id);
      if (!task.isCreatedBySubscription) {
        await this.db.downloadChapterRepository.delete({ task: id });
      }
      await this.db.downloadTaskRepository.remove(task);
      return task;
    }
    return task;
  }

  async deleteDownloadTaskByMangaId(mangaId: string) {
    const task = await this.db.downloadTaskRepository.findOne({ targetManga: mangaId });
    if (task !== undefined) {
      this.cancelTask(task.id);
      if (!task.isCreatedBySubscription) {
        await this.db.downloadChapterRepository.delete({ task: task.id });
      }
      await this.db.downloadTaskRepository.remove(task);
      return task;
    }
    return task;
  }

  async startDownloadTask(id: number) {
    const task = await this.db.downloadTaskRepository.findOne(id);
    if (
      task !== undefined &&
      (task.status === DownloadTaskStatus.Paused || task.status === DownloadTaskStatus.Error)
    ) {
      task.status = DownloadTaskStatus.Waiting;
      this.db.downloadTaskRepository.save(task);
      this.start();
    }
    return task;
  }

  async pauseDownloadTask(id: number) {
    const task = await this.db.downloadTaskRepository.findOne(id);
    if (
      task !== undefined &&
      (task.status === DownloadTaskStatus.Downloading || task.status === DownloadTaskStatus.Waiting)
    ) {
      this.cancelTask(id);
      task.status = DownloadTaskStatus.Paused;
      this.db.downloadTaskRepository.save(task);
    }
    return task;
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
        logger.info(`Download: ${task.providerId}/${task.sourceManga} -> ${task.targetManga}`);
        this.currentTaskId = task.id;

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
        this.currentTaskId = undefined;
      }
    }
  }

  private async downloadManga(task: DownloadTask) {
    await this.library.createManga(task.targetManga);

    const provider = this.providerManager.getProvider(task.providerId);
    if (provider === undefined) throw Error('Provider not exist');

    const mangaAccessor = await this.library.openManga(task.targetManga).then((result) =>
      result.onFailure((e) => {
        throw Error('Manga not exist');
      })
    );

    const detail = await this.downloadMangaDetail(provider, mangaAccessor, task.sourceManga);

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
        const chapterAccessor = await mangaAccessor
          .openChapter(collection.id, chapterId)
          .then((result) =>
            result.onFailure((e) => {
              throw Error('Chapter not exist');
            })
          );
        const isChapterError = await this.downloadChapter(
          provider,
          chapterAccessor!,
          detail.id,
          chapter.id
        );

        if (isChapterError) hasChapterError = true;
        else {
          await this.db.downloadChapterRepository.insert({
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

  private async downloadMangaDetail(
    provider: ProviderAdapter,
    accessor: AccessorManga,
    mangaId: string
  ) {
    const detail = await provider.requestMangaDetail(mangaId);
    let thumb = undefined;
    if (detail.thumb !== undefined) thumb = await provider.requestImage(detail.thumb);
    await accessor.setMangaDetail(detail, thumb);
    this.cancelIfNeed();
    return detail;
  }

  private async downloadChapter(
    provider: ProviderAdapter,
    accessor: AccessorChapter,
    mangaId: string,
    chapterId: string
  ) {
    logger.info(`Download chapter: chapter:${chapterId}`);
    const imageUrls = await provider.requestChapterContent(mangaId, chapterId);
    this.cancelIfNeed();

    let hasImageError = false;
    for (const [i, url] of imageUrls.entries()) {
      const imageFilename = `${i}.jpg`;
      if (await accessor.isImageExist(imageFilename)) continue;

      try {
        const data = await provider.requestImage(url);
        await accessor.writeImage(imageFilename, data);
      } catch (error) {
        logger.error(`Image error at: ${provider.name}:${chapterId}:${i}`);
        logger.error(`Image error: ${error.stack}`);
        hasImageError = true;
      }
      this.cancelIfNeed();
    }
    return hasImageError;
  }
}
