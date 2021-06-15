import { Repository } from 'typeorm';

import { logger } from '../logger';
import { DownloadDesc, DownloadStatus } from '../database/entity/download_desc';
import { LibraryAccessor } from '../library/accessor.library';
import { ProviderManager } from '../provider/manager';

import { AsyncTaskCancelError, download, DownloadTask } from './download_task';
import { BadRequestError, ConflictError, NotFoundError } from './exception';

export class DownloadService {
  constructor(
    private readonly repository: Repository<DownloadDesc>,
    private readonly library: LibraryAccessor,
    private readonly providerManager: ProviderManager
  ) {}

  private isRunning = false;
  private currentDownloadTask: DownloadTask | undefined = undefined;

  start(): void {
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
      let provider = undefined;
      let accessor = undefined;
      try {
        provider = this.providerManager.getProvider(desc.providerId);
        accessor = await this.library.getManga(desc.id);
      } catch (e) {}
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

  /* item api */
  async createDownloadTask(
    providerId: string,
    sourceManga: string,
    targetManga: string,
    shouldCreateSubscription: boolean
  ) {
    if (!this.library.validateMangaId(targetManga))
      throw new BadRequestError(`Manga:${targetManga} is not a valid manga id`);

    const taskInDb = await this.repository.findOne(targetManga);
    if (taskInDb !== undefined)
      throw new ConflictError(`Download task:${targetManga} already exist`);

    if (this.providerManager.getProvider(providerId) === undefined)
      throw new BadRequestError(`Provider:${providerId} not found`);

    if (await this.library.isMangaExist(targetManga))
      await this.library.createManga(targetManga);

    if (shouldCreateSubscription) {
      const manga = await this.library.getManga(targetManga);
      manga.setSubscription({ providerId, mangaId: sourceManga });
    }

    const task = this.repository.create({
      providerId,
      sourceManga,
      id: targetManga,
      isCreatedBySubscription: false,
    });
    await this.repository.save(task);
    this.start();
    return task;
  }

  async deleteDownloadTask(id: string) {
    const task = await this.repository.findOne(id);
    if (task !== undefined) {
      this.currentDownloadTask?.cancel(id);
      await this.repository.remove(task);
    } else {
      throw new NotFoundError(`Download task:${id} not found`);
    }
    return task;
  }
}
