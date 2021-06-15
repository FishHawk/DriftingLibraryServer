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
      const manga = await this.findNext();
      if (manga === undefined) break;

      const subscription = await manga.getSubscription();
      const provider = this.providerManager.getProvider(
        subscription.providerId
      );
      if (provider === undefined) {
        logger.warn(`Subscription: unsupport provider, auto remove.`);
        await manga.deleteSubscription();
        await manga.removeSyncMark();
        continue;
      }

      try {
        this.currentDownloadTask = download(
          provider,
          manga,
          subscription.mangaId
        );
        const isCompleted = await this.currentDownloadTask.promise;
        await manga.removeSyncMark();
        if (!isCompleted) {
          // TODO : set error state
        }
      } catch (e) {
        if (e instanceof AsyncTaskCancelError) {
          logger.info(`Download is canceled`);
        } else {
          logger.error(`Download error: ${e.stack}`);
          // TODO : set error state
        }
      } finally {
        this.currentDownloadTask = undefined;
      }
    }
  }

  private async findNext() {
    const mangaIds = await this.library.listMangaId();
    for (const mangaId of mangaIds) {
      const manga = this.library.getManga(mangaId);
      if ((await manga).hasSyncMark()) return manga;
    }
    return undefined;
  }
}
