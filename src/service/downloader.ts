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
      const { manga, provider, source } = task;

      /* download */
      try {
        this.currentDownloadTask = download(provider, manga, source.mangaId);
        const isCompleted = await this.currentDownloadTask.promise;
        if (isCompleted) {
          source.state = 'updated';
        } else {
          source.state = 'error';
          source.message = 'Some chapter incomplete';
        }
        await manga.setSource(source);
      } catch (e) {
        if (e instanceof AsyncTaskCancelError) {
          logger.info(`Download is canceled`);
        } else {
          logger.error(`Download error: ${e.stack}`);
          source.state = 'error';
          source.message = 'unknown error';
          await task.manga.setSource(source);
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
      if (!(await manga.hasSource())) continue;

      const source = await manga.getSource();
      if (source.state !== 'waiting') continue;

      const provider = this.providerManager.getProvider(source.providerId);
      if (provider === undefined) {
        logger.warn(`Manga ${mangaId}: subscription has unsupport provider.`);
        source.state = 'error';
        source.message = 'unsupport provider';
        await manga.setSource(source);
        continue;
      }

      source.state = 'downloading';
      source.message = undefined;
      await manga.setSource(source);
      return { manga, provider, source };
    }
    return undefined;
  }
}
