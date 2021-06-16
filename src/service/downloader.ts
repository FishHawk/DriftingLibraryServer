import { logger } from '../logger';
import { LibraryAccessor } from '../library/accessor.library';
import { ProviderManager } from '../provider/manager';

import { AsyncTaskCancelError, download, DownloadTask } from './download_task';

export class Downloader {
  constructor(
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
      const task = await this.findNext();
      if (task === undefined) break;

      try {
        this.currentDownloadTask = download(
          task.provider,
          task.manga,
          task.subscription.mangaId
        );
        const isCompleted = await this.currentDownloadTask.promise;
        if (isCompleted) {
          task.subscription.state = 'updated';
          task.subscription.message = '';
        } else {
          task.subscription.state = 'error';
          task.subscription.message = 'unknown error';
        }
        await task.manga.setSubscription(task.subscription);
      } catch (e) {
        if (e instanceof AsyncTaskCancelError) {
          logger.info(`Download is canceled`);
        } else {
          logger.error(`Download error: ${e.stack}`);
          task.subscription.state = 'error';
          task.subscription.message = 'unknown error';
          await task.manga.setSubscription(task.subscription);
        }
      } finally {
        this.currentDownloadTask = undefined;
      }
    }
  }

  private async findNext() {
    const mangaIds = await this.library.listMangaId();
    for (const mangaId of mangaIds) {
      const manga = await this.library.getManga(mangaId);
      if (!(await manga.hasSubscription())) continue;

      const subscription = await manga.getSubscription();
      if (subscription.state !== 'waiting') continue;

      const provider = this.providerManager.getProvider(
        subscription.providerId
      );
      if (provider === undefined) {
        logger.warn(`Manga ${mangaId}: subscription has unsupport provider.`);
        subscription.state = 'error';
        subscription.message = 'unsupport provider';
        await manga.setSubscription(subscription);
        continue;
      }

      return { manga, provider, subscription };
    }
    return undefined;
  }
}
