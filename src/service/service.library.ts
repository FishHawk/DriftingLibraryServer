import { BadRequestError, NotFoundError } from '../controller/exception';
import * as Entity from '../library/entity';
import { LibraryAccessor } from '../library/accessor.library';
import { MangaAccessor } from '../library/accessor.manga';
import { Image } from '../util/fs';

import { DownloadService } from './service.download';
import { SubscriptionService } from './service.subscription';

export class LibraryService {
  constructor(
    private readonly library: LibraryAccessor,
    private readonly downloadService: DownloadService,
    private readonly subscriptionService: SubscriptionService
  ) {}

  async listManga(
    lastTime: number | undefined,
    limit: number,
    keywords: string
  ) {
    return this.library.listManga(lastTime, limit, keywords);
  }

  async getManga(mangaId: string) {
    const manga = await this.assureManga(mangaId);
    manga.removeNewMark();
    const mangaDetail = await manga.getDetail();
    return mangaDetail;
  }

  async deleteManga(mangaId: string) {
    await this.assureManga(mangaId);
    await this.library.deleteManga(mangaId);
    await this.subscriptionService.deleteSubscription(mangaId);
    await this.downloadService.deleteDownloadTask(mangaId);
  }

  async updateMangaMetadata(mangaId: string, metadata: Entity.MetadataDetail) {
    const manga = await this.assureManga(mangaId);
    manga.setMetadata(metadata);
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

  private async assureManga(mangaId: string) {
    if (!this.library.validateMangaId(mangaId))
      throw new BadRequestError(`${mangaId} is not legal manga id`);
    if (!(await this.library.isMangaExist(mangaId)))
      throw new NotFoundError(`Manga:${mangaId} not found`);
    return await this.library.getManga(mangaId);
  }
}
