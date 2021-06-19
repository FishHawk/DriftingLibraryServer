import { Job, scheduleJob } from 'node-schedule';

import { logger } from '@logger';
import * as Entity from '@library/entity';
import { LibraryAccessor } from '@library/accessor.library';
import { ProviderManager } from '@provider/manager';
import { Image } from '@util/fs';

import { BadRequestError, ConflictError, NotFoundError } from './exception';
import { Downloader } from './downloader';

export class LibraryService {
  private job!: Job;

  constructor(
    private readonly library: LibraryAccessor,
    private readonly providerManager: ProviderManager,
    private readonly downloader: Downloader
  ) {
    this.job = scheduleJob('0 0 4 * * *', () => {
      this.syncAllMangaSource();
    });
  }

  async listManga(
    lastTime: number | undefined,
    limit: number,
    keywords: string
  ) {
    return this.library.listManga(lastTime, limit, keywords);
  }

  async createManga(
    mangaId: string,
    providerId: string,
    sourceMangaId: string,
    keepAfterCompleted: boolean
  ) {
    await this.assureNoManga(mangaId);
    if (this.providerManager.getProvider(providerId) === undefined)
      throw new BadRequestError(`Provider ${providerId} not support`);

    await this.library.createManga(mangaId);
    const manga = await this.assureManga(mangaId);

    await manga.setSource({
      providerId,
      mangaId: sourceMangaId,
      keepAfterCompleted,
      state: 'waiting',
    });
    this.downloader.start();
  }

  async getManga(mangaId: string) {
    const manga = await this.assureManga(mangaId);
    await manga.removeNewMark();
    const mangaDetail = await manga.getDetail();
    return mangaDetail;
  }

  async deleteManga(mangaId: string) {
    await this.assureManga(mangaId);
    await this.downloader.cancel(mangaId);
    await this.library.deleteManga(mangaId);
  }

  async updateMangaMetadata(mangaId: string, metadata: Entity.MetadataDetail) {
    const manga = await this.assureManga(mangaId);
    await manga.setMetadata(metadata);
  }

  async createMangaSource(
    mangaId: string,
    providerId: string,
    sourceMangaId: string,
    keepAfterCompleted: boolean
  ) {
    const manga = await this.assureManga(mangaId);
    if (await manga.hasSource())
      throw new ConflictError(`Manga:${mangaId} source already exist`);

    if (this.providerManager.getProvider(providerId) === undefined)
      throw new BadRequestError(`Provider ${providerId} not support`);

    await manga.setSource({
      providerId,
      mangaId: sourceMangaId,
      keepAfterCompleted,
      state: 'waiting',
    });
    this.downloader.start();
  }

  async deleteMangaSource(mangaId: string) {
    // TODO : There may be uncompleted chapters
    const manga = await this.assureManga(mangaId);
    if (!(await manga.hasSource()))
      throw new NotFoundError(`Manga:${mangaId} source not found`);
    await this.downloader.cancel(mangaId);
    await manga.deleteSource();
  }

  async syncMangaSource(mangaId: string) {
    const manga = await this.assureManga(mangaId);
    if (!(await manga.hasSource()))
      throw new NotFoundError(`Manga:${mangaId} source not found`);

    const source = await manga.getSource();
    if (source.state === 'downloading' || source.state === 'waiting')
      throw new ConflictError(`Manga:${mangaId} already start downloading`);

    source.state = 'waiting';
    source.message = '';
    await manga.setSource(source);
    this.downloader.start();
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

  async syncAllMangaSource() {
    logger.info('Update source');
    const mangaIds = await this.library.listMangaId();
    for (const mangaId of mangaIds) {
      try {
        const manga = await this.assureManga(mangaId);
        if (await manga.hasSource()) {
          const source = await manga.getSource();
          if (source.state !== 'downloading') {
            source.state = 'waiting';
            source.message = '';
            await manga.setSource(source);
          }
        }
      } catch (e) {
        logger.warn(`Error in update ${mangaId} source`);
      }
    }
    this.downloader.start();
  }

  private async assureManga(mangaId: string) {
    if (!this.library.validateMangaId(mangaId))
      throw new BadRequestError(`${mangaId} is not legal manga id`);
    if (!(await this.library.isMangaExist(mangaId)))
      throw new NotFoundError(`Manga:${mangaId} not found`);
    return await this.library.getManga(mangaId);
  }

  private async assureNoManga(mangaId: string) {
    if (!this.library.validateMangaId(mangaId))
      throw new BadRequestError(`${mangaId} is not legal manga id`);
    if (await this.library.isMangaExist(mangaId))
      throw new ConflictError(`Manga:${mangaId} already exist`);
  }
}
