import { logger } from '../logger';
import { DatabaseAdapter } from '../database/adapter';
import { DownloadDesc, DownloadTaskStatus } from '../database/entity/download_task';
import { ProviderManager } from '../provider/manager';
import { LibraryAccessor } from '../library/accessor.library';
import { fail, Result, ok } from '../util/result';

import { AsyncTaskCancelError, DownloadTask } from './download_task';

export class DownloadService {
  constructor(
    private readonly db: DatabaseAdapter,
    private readonly library: LibraryAccessor,
    private readonly providerManager: ProviderManager
  ) {}

  private isRunning = false;
  private currentDownloadTask: DownloadTask | undefined = undefined;

  private start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.downloadLoop().then(() => (this.isRunning = false));
  }

  private async downloadLoop() {
    while (true) {
      //TODO: order by update timestamp
      const desc = await this.db.downloadTaskRepository.findOne({
        where: { status: DownloadTaskStatus.Waiting },
      });
      if (desc === undefined) break;

      try {
        logger.info(`Download: ${desc.providerId}/${desc.sourceManga} -> ${desc.id}`);

        desc.status = DownloadTaskStatus.Downloading;
        await this.db.downloadTaskRepository.save(desc);

        const provider = this.providerManager.getProvider(desc.providerId);
        if (provider === undefined) throw Error('Provider not exist');

        const mangaAccessor = await this.library.getManga(desc.id).then((result) =>
          result.whenFail(() => {
            throw Error('Manga not exist');
          })
        );

        this.currentDownloadTask = new DownloadTask(
          this.db,
          mangaAccessor,
          provider,
          desc
        );
        await this.currentDownloadTask.run();
      } catch (error) {
        if (error instanceof AsyncTaskCancelError) {
          logger.info(`Download is canceled`);
        } else {
          logger.error(`Download error: ${error.stack}`);
          desc.status = DownloadTaskStatus.Error;
          await this.db.downloadTaskRepository.save(desc);
        }
      } finally {
        this.currentDownloadTask = undefined;
      }
    }
  }

  /* api */
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
  ): Promise<Result<DownloadDesc, CreateFail>> {
    if (this.providerManager.getProvider(providerId) === undefined)
      return fail(CreateFail.UnsupportedProvider);

    const result = (await this.library.createManga(targetManga)).whenFail((f) => {
      if (f === LibraryAccessor.CreateFail.IllegalMangaId)
        return CreateFail.IlligalTargetMangaId;
      if (f === LibraryAccessor.CreateFail.MangaAlreadyExist)
        return CreateFail.MangaAlreadyExist;
    });
    if (result !== undefined) return fail(result);

    const task = this.db.downloadTaskRepository.create({
      providerId,
      sourceManga,
      id: targetManga,
      isCreatedBySubscription,
    });
    await this.db.downloadTaskRepository.save(task);
    this.start();
    return ok(task);
  }

  async deleteDownloadTask(id: string): Promise<Result<DownloadDesc, AccessFail>> {
    const task = await this.db.downloadTaskRepository.findOne(id);
    if (task === undefined) return fail(AccessFail.TaskNotFound);

    this.currentDownloadTask?.cancel(id);
    if (!task.isCreatedBySubscription)
      await this.db.downloadChapterRepository.delete({ task: id });
    await this.db.downloadTaskRepository.remove(task);
    return ok(task);
  }

  async startDownloadTask(id: string): Promise<Result<DownloadDesc, AccessFail>> {
    const task = await this.db.downloadTaskRepository.findOne(id);
    if (task === undefined) return fail(AccessFail.TaskNotFound);

    if (
      task.status === DownloadTaskStatus.Paused ||
      task.status === DownloadTaskStatus.Error
    ) {
      task.status = DownloadTaskStatus.Waiting;
      await this.db.downloadTaskRepository.save(task);
      this.start();
    }
    return ok(task);
  }

  async pauseDownloadTask(id: string): Promise<Result<DownloadDesc, AccessFail>> {
    const task = await this.db.downloadTaskRepository.findOne(id);
    if (task === undefined) return fail(AccessFail.TaskNotFound);

    if (
      task.status === DownloadTaskStatus.Downloading ||
      task.status === DownloadTaskStatus.Waiting
    ) {
      this.currentDownloadTask?.cancel(id);
      task.status = DownloadTaskStatus.Paused;
      await this.db.downloadTaskRepository.save(task);
    }
    return ok(task);
  }
}

/* fail */
export namespace DownloadService {
  export enum AccessFail {
    TaskNotFound,
  }

  export enum CreateFail {
    IlligalTargetMangaId,
    UnsupportedProvider,
    MangaAlreadyExist,
    TaskAlreadyExist,
  }
}
import CreateFail = DownloadService.CreateFail;
import AccessFail = DownloadService.AccessFail;
