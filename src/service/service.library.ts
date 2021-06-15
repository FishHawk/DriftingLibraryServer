import { Job, scheduleJob } from 'node-schedule';
import { Repository } from 'typeorm';

import * as Entity from '../library/entity';
import { LibraryAccessor } from '../library/accessor.library';
import { Image } from '../util/fs';
import { logger } from '../logger';
import { DownloadDesc } from '../database/entity';

import { BadRequestError, NotFoundError } from './exception';
import { DownloadService } from './service.download';
import { Downloader } from './downloader';

export class LibraryService {
  private job!: Job;

  constructor(
    private readonly library: LibraryAccessor,
    private readonly repository: Repository<DownloadDesc>,
    private readonly downloadService: DownloadService,
    private readonly downloader: Downloader
  ) {
    this.job = scheduleJob('0 0 4 * * *', () => {
      this.syncAllMangaSubscription();
    });
  }

  async listManga(
    lastTime: number | undefined,
    limit: number,
    keywords: string
  ) {
    return this.library.listManga(lastTime, limit, keywords);
  }

  async getManga(mangaId: string) {
    const manga = await this.assureManga(mangaId);
    await manga.removeNewMark();
    const mangaDetail = await manga.getDetail();
    return mangaDetail;
  }

  async deleteManga(mangaId: string) {
    await this.assureManga(mangaId);
    await this.downloadService.deleteDownloadTask(mangaId);
    await this.library.deleteManga(mangaId);
  }

  async updateMangaMetadata(mangaId: string, metadata: Entity.MetadataDetail) {
    const manga = await this.assureManga(mangaId);
    await manga.setMetadata(metadata);
  }

  async deleteMangaSubscription(mangaId: string) {
    const manga = await this.assureManga(mangaId);
    if (!(await manga.hasSubscription()))
      throw new NotFoundError(`Manga:${mangaId} subscription not found`);
    await this.downloadService.deleteDownloadTask(mangaId);
    await manga.deleteSubscription();
  }

  async syncMangaSubscription(mangaId: string) {
    const manga = await this.assureManga(mangaId);

    if (await manga.hasSubscription()) {
      const subscription = await manga.getSubscription();

      const taskInDb = await this.repository.findOne(mangaId);
      if (taskInDb !== undefined) {
        this.downloader.start();
      } else {
        const task = this.repository.create({
          providerId: subscription.providerId,
          sourceManga: subscription.mangaId,
          id: mangaId,
          isCreatedBySubscription: true,
        });
        await this.repository.save(task);
        this.downloader.start();
      }
    }
  }

  async getMangaThumb(mangaId: string) {
    const manga = await this.assureManga(mangaId);
    const thumb = await manga.getThumb();
    if (thumb === undefined)
      throw new NotFoundError(`Manga:${mangaId} thumb not found`);
    return thumb;
  }

  async updateMangaThumb(mangaId: string, thumb: Image) {
    const manga = await this.assureManga(mangaId);
    await manga.setThumb(thumb);
  }

  async getChapter(
    mangaId: string,
    collectionId: string | undefined,
    chapterId: string | undefined
  ) {
    const manga = await this.assureManga(mangaId);
    const chapter = await manga.getChapter(collectionId ?? '', chapterId ?? '');
    if (chapter === undefined)
      throw new NotFoundError(
        `Chapter:${mangaId}/${collectionId}/${chapterId} not found`
      );
    return await chapter.listImage();
  }

  async getImage(
    mangaId: string,
    collectionId: string | undefined,
    chapterId: string | undefined,
    imageId: string
  ) {
    const manga = await this.assureManga(mangaId);
    const chapter = await manga.getChapter(collectionId ?? '', chapterId ?? '');
    if (chapter === undefined)
      throw new NotFoundError(
        `Chapter:${mangaId}/${collectionId}/${chapterId} not found`
      );
    const image = chapter.readImage(imageId);
    if (image === undefined) {
      throw new NotFoundError(
        `Image:${mangaId}/${collectionId}/${chapterId}/${imageId} not found`
      );
    }
    return image;
  }

  async syncAllMangaSubscription() {
    logger.info('Update subscription');
    const mangaIds = await this.library.listMangaId();
    for (const mangaId of mangaIds) {
      const manga = await this.library.getManga(mangaId);
      if (await manga.hasSubscription()) {
        await this.syncMangaSubscription(mangaId);
      }
    }
  }

  private async assureManga(mangaId: string) {
    if (!this.library.validateMangaId(mangaId))
      throw new BadRequestError(`${mangaId} is not legal manga id`);
    if (!(await this.library.isMangaExist(mangaId)))
      throw new NotFoundError(`Manga:${mangaId} not found`);
    return await this.library.getManga(mangaId);
  }
}
