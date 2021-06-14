import { Response } from 'express';
import multer from 'multer';

import { Image } from '../util/fs';

import { Controller } from './decorator/controller';
import { UseBefore } from './decorator/middleware';
import { Res, Query, Param, Body, ImageFile } from './decorator/parameter';
import { Get, Delete, Put } from './decorator/verb';
import { LibraryService } from '../service/service.library';

const upload = multer({ storage: multer.memoryStorage() });

@Controller('/library')
export class LibraryController {
  constructor(private readonly service: LibraryService) {}

  @Get('/mangas')
  async listManga(
    @Res() res: Response,
    @Query('lastTime') lastTime: number,
    @Query('limit') limit: number,
    @Query('keywords') keywords: string
  ) {
    const mangas = await this.service.listManga(lastTime, limit, keywords);
    return res.json(mangas);
  }

  @Get('/mangas/:mangaId')
  async getManga(@Res() res: Response, @Param('mangaId') mangaId: string) {
    const manga = await this.service.getManga(mangaId);
    return res.json(manga);
  }

  @Delete('/mangas/:mangaId')
  async deleteManga(@Res() res: Response, @Param('mangaId') mangaId: string) {
    await this.service.deleteManga(mangaId);
    return res.json(mangaId);
  }

  @Put('/mangas/:mangaId/metadata')
  async updateMangaMetadata(
    @Res() res: Response,
    @Param('mangaId') mangaId: string,
    @Body() body: any
  ) {
    await this.service.updateMangaMetadata(mangaId, body);
    return res.status(200);
  }

  @Delete('/mangas/:mangaId/subscription')
  async deleteMangaSubscription(
    @Res() res: Response,
    @Param('mangaId') mangaId: string
  ) {
    await this.service.deleteMangaSubscription(mangaId);
    return res.status(200);
  }

  @Get('/mangas/:mangaId/thumb')
  async getMangaThumb(@Res() res: Response, @Param('mangaId') mangaId: string) {
    const thumb = await this.service.getMangaThumb(mangaId);
    return thumb.pipe(res.type(thumb.mime));
  }

  @UseBefore(upload.single('thumb'))
  @Put('/mangas/:mangaId/thumb')
  async updateMangaThumb(
    @Res() res: Response,
    @Param('mangaId') mangaId: string,
    @ImageFile() thumb: Image
  ) {
    await this.service.updateMangaThumb(mangaId, thumb);
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
    const content = await this.service.getChapter(
      mangaId,
      collectionId,
      chapterId
    );
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
    const image = await this.service.getImage(
      mangaId,
      collectionId,
      chapterId,
      imageId
    );
    return image.pipe(res.type(image.mime));
  }
}
