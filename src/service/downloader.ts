import { Repository } from 'typeorm';

import { logger } from '../logger';
import { DownloadDesc, DownloadStatus } from '../database/entity/download_desc';
import { LibraryAccessor } from '../library/accessor.library';
import { ProviderManager } from '../provider/manager';

import { AsyncTaskCancelError, download, DownloadTask } from './download_task';

export class Downloader {
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

  cancel(mangaId: string) {
    this.currentDownloadTask?.cancel(mangaId);
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
}
