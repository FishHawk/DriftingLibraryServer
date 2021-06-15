import { Repository } from 'typeorm';

import { DownloadDesc } from '../database/entity/download_desc';
import { LibraryAccessor } from '../library/accessor.library';
import { ProviderManager } from '../provider/manager';

import { BadRequestError, ConflictError, NotFoundError } from './exception';
import { Downloader } from './downloader';

export class DownloadService {
  constructor(
    private readonly repository: Repository<DownloadDesc>,
    private readonly library: LibraryAccessor,
    private readonly providerManager: ProviderManager,
    private readonly downloader: Downloader
  ) {}
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
    this.downloader.start();
    return task;
  }

  async deleteDownloadTask(id: string) {
    const task = await this.repository.findOne(id);
    if (task !== undefined) {
      this.downloader.cancel(id);
      await this.repository.remove(task);
    } else {
      throw new NotFoundError(`Download task:${id} not found`);
    }
    return task;
  }
}
