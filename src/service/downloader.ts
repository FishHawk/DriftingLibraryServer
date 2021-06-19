import { logger } from '@logger';
import { LibraryAccessor } from '@library/accessor.library';
import { ProviderManager } from '@provider/manager';

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
      let shouldDeleteSource = false;
      try {
        this.currentDownloadTask = download(provider, manga, source.mangaId);
        const result = await this.currentDownloadTask.promise;
        if (!result.isAllUpdated) {
          source.state = 'error';
          source.message = 'Some chapter incomplete';
        } else {
          source.state = 'updated';
          if (result.isCompleted) shouldDeleteSource = true;
        }
      } catch (e) {
        source.state = 'error';
        if (e instanceof AsyncTaskCancelError) {
          logger.info(`Download is canceled`);
          source.message = 'Update cancelled';
        } else {
          logger.error(`Download error: ${e.stack}`);
          source.message = 'Unknown error';
        }
      }
      this.currentDownloadTask = undefined;

      /* update source */
      try {
        if (!(await this.library.isMangaExist(manga.id))) continue;
        if (shouldDeleteSource) await manga.deleteSource();
        else await manga.setSource(source);
      } catch (e) {
        logger.error(`Download error when update source: ${e.stack}`);
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
        logger.warn(`Manga ${mangaId}: source has unsupport provider.`);
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
