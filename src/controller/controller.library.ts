import { Response } from 'express';
import multer from 'multer';

import { DownloadService } from '../service/service.download';
import { SubscriptionService } from '../service/service.subscription';
import { LibraryAccessor } from '../library/accessor.library';
import { Image } from '../util/fs';

import { Controller } from './decorator/controller';
import { UseBefore } from './decorator/middleware';
import { Res, Query, Param, Body, ImageFile } from './decorator/parameter';
import { Get, Delete, Put } from './decorator/verb';
import { assertExist } from './exception';

const upload = multer({ storage: multer.memoryStorage() });

@Controller('/library')
export class LibraryController {
  constructor(
    private readonly library: LibraryAccessor,
    private readonly downloadService: DownloadService,
    private readonly subscriptionService: SubscriptionService
  ) {}

  @Get('/mangas')
  async listManga(
    @Res() res: Response,
    @Query('lastTime') lastTime: number,
    @Query('limit') limit: number,
    @Query('keywords') keywords: string
  ) {
    const mangas = await this.library.search(lastTime, limit, keywords);
    return res.json(mangas);
  }

  @Get('/mangas/:mangaId')
  async getManga(@Res() res: Response, @Param('mangaId') mangaId: string) {
    const manga = await this.library.getManga(mangaId);
    assertExist(manga, 'manga');
    manga.removeNewMark();
    const mangaDetail = await manga.getDetail();
    return res.json(mangaDetail);
  }

  @Delete('/mangas/:mangaId')
  async deleteManga(@Res() res: Response, @Param('mangaId') mangaId: string) {
    const manga = await this.library.deleteManga(mangaId);
    assertExist(manga, 'manga');
    await this.subscriptionService.deleteSubscription(mangaId);
    await this.downloadService.deleteDownloadTask(mangaId);
    return res.json(mangaId);
  }

  @Put('/mangas/:mangaId/metadata')
  async updateMangaMetadata(
    @Res() res: Response,
    @Param('mangaId') mangaId: string,
    @Body() body: any
  ) {
    const manga = await this.library.getManga(mangaId);
    assertExist(manga, 'manga');
    await manga.setMetadata(body);
    return res.status(200);
  }

  @Get('/mangas/:mangaId/thumb')
  async getMangaThumb(@Res() res: Response, @Param('mangaId') mangaId: string) {
    const manga = await this.library.getManga(mangaId);
    assertExist(manga, 'manga');
    const thumb = await manga.getThumb();
    assertExist(thumb, 'thumb');
    return thumb.pipe(res.type(thumb.mime));
  }

  @UseBefore(upload.single('thumb'))
  @Put('/mangas/:mangaId/thumb')
  async updateMangaThumb(
    @Res() res: Response,
    @Param('mangaId') mangaId: string,
    @ImageFile() thumb: Image
  ) {
    const manga = await this.library.getManga(mangaId);
    assertExist(manga, 'manga');
    await manga.setThumb(thumb);
    return res.status(200);
  }

  @Get('/mangas/:mangaId/chapters/:chapterId?')
  @Get('/mangas/:mangaId/chapters/:collectionId/:chapterId')
  async getChapter(
    @Res() res: Response,
    @Param('mangaId') mangaId: string,
    @Param('collectionId') collectionId: string | undefined,
    @Param('chapterId') chapterId: string | undefined
  ) {
    const manga = await this.library.getManga(mangaId);
    assertExist(manga, 'manga');
    const chapter = await manga.getChapter(collectionId ?? '', chapterId ?? '');
    assertExist(chapter, 'chapter');
    const content = await chapter.listImage();
    return res.json(content);
  }

  @Get('/mangas/:mangaId/images/:chapterId?/:imageId')
  @Get('/mangas/:mangaId/images/:collectionId/:chapterId/:imageId')
  async getImage(
    @Res() res: Response,
    @Param('mangaId') mangaId: string,
    @Param('collectionId') collectionId: string | undefined,
    @Param('chapterId') chapterId: string | undefined,
    @Param('imageId') imageId: string
  ) {
    const manga = await this.library.getManga(mangaId);
    assertExist(manga, 'manga');
    const chapter = await manga.getChapter(collectionId ?? '', chapterId ?? '');
    assertExist(chapter, 'chapter');
    const image = chapter.readImage(imageId);
    assertExist(image, 'image');
    return image.pipe(res.type(image.mime));
  }
}
