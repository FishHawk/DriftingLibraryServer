import { Repository } from 'typeorm';

import { logger } from '../logger';
import { DownloadDesc, DownloadStatus } from '../database/entity/download_desc';
import { LibraryAccessor } from '../library/accessor.library';
import { ProviderManager } from '../provider/manager';
import { fail, Result, ok } from '../util/result';

import { AsyncTaskCancelError, download, DownloadTask } from './download_task';

export class DownloadService {
  constructor(
    private readonly repository: Repository<DownloadDesc>,
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
      /* fetch next download desc */
      const desc = await this.repository.findOne({
        where: { status: DownloadStatus.Waiting },
      });
      if (desc === undefined) break;

      /* check desc argument */
      const provider = this.providerManager.getProvider(desc.providerId);
      const accessor = await this.library.getManga(desc.id);
      if (provider === undefined || accessor === undefined) {
        logger.warn(`Download: illegal task, auto remove.`);
        await this.repository.remove(desc);
        continue;
      }

      /* start download task */
      desc.status = DownloadStatus.Downloading;
      await this.repository.save(desc);

      try {
        this.currentDownloadTask = download(
          provider,
          accessor,
          desc.sourceManga,
          desc.isCreatedBySubscription
        );
        const isCompleted = await this.currentDownloadTask.promise;
        if (isCompleted) {
          await this.repository.remove(desc);
        } else {
          desc.status = DownloadStatus.Error;
          await this.repository.save(desc);
        }
      } catch (e) {
        if (e instanceof AsyncTaskCancelError) {
          logger.info(`Download is canceled`);
        } else {
          logger.error(`Download error: ${e.stack}`);
          desc.status = DownloadStatus.Error;
          await this.repository.save(desc);
        }
      } finally {
        this.currentDownloadTask = undefined;
      }
    }
  }

  /* list api */
  async getAllDownloadTask() {
    return this.repository.find();
  }

  async startAllDownloadTask() {
    await this.repository.update(
      { status: DownloadStatus.Paused },
      { status: DownloadStatus.Waiting }
    );
    await this.repository.update(
      { status: DownloadStatus.Error },
      { status: DownloadStatus.Waiting }
    );
    this.start();
  }

  async pauseAllDownloadTask() {
    await this.repository.update(
      { status: DownloadStatus.Waiting },
      { status: DownloadStatus.Paused }
    );
    await this.repository.update(
      { status: DownloadStatus.Downloading },
      { status: DownloadStatus.Paused }
    );
  }

  /* item api */
  async createDownloadTask(
    providerId: string,
    sourceManga: string,
    targetManga: string,
    isCreatedBySubscription: boolean = false
  ): Promise<Result<DownloadDesc, CreateFail>> {
    const taskInDb = await this.repository.findOne(targetManga);
    if (taskInDb == undefined) return fail(CreateFail.TaskAlreadyExist);

    if (this.providerManager.getProvider(providerId) === undefined)
      return fail(CreateFail.UnsupportedProvider);

    const result = (await this.library.createManga(targetManga)).whenFail(
      (f) => {
        if (f === LibraryAccessor.CreateFail.IllegalMangaId)
          return CreateFail.IlligalTargetMangaId;
      }
    );
    if (result !== undefined) return fail(result);

    const task = this.repository.create({
      providerId,
      sourceManga,
      id: targetManga,
      isCreatedBySubscription,
    });
    await this.repository.save(task);
    this.start();
    return ok(task);
  }

  async deleteDownloadTask(id: string) {
    const task = await this.repository.findOne(id);
    if (task !== undefined) {
      this.currentDownloadTask?.cancel(id);
      await this.repository.remove(task);
    }
    return task;
  }

  async startDownloadTask(id: string) {
    const task = await this.repository.findOne(id);
    if (task !== undefined) {
      if (
        task.status === DownloadStatus.Paused ||
        task.status === DownloadStatus.Error
      ) {
        task.status = DownloadStatus.Waiting;
        await this.repository.save(task);
        this.start();
      }
    }
    return task;
  }

  async pauseDownloadTask(id: string) {
    const task = await this.repository.findOne(id);
    if (task !== undefined) {
      if (
        task.status === DownloadStatus.Downloading ||
        task.status === DownloadStatus.Waiting
      ) {
        this.currentDownloadTask?.cancel(id);
        task.status = DownloadStatus.Paused;
        await this.repository.save(task);
      }
    }
    return task;
  }
}

/* fail */
export namespace DownloadService {
  export enum CreateFail {
    IlligalTargetMangaId,
    UnsupportedProvider,
    TaskAlreadyExist,
  }
}
import CreateFail = DownloadService.CreateFail;
