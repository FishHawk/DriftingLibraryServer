import { Response } from 'express';
import multer from 'multer';

import { LibraryService } from '@service/service.library';
import { Image } from '@util/fs';

import { Controller } from './decorator/controller';
import { UseBefore } from './decorator/middleware';
import {
  Res,
  Query,
  Param,
  Body,
  ImageFile,
  BodyField,
} from './decorator/parameter';
import { Get, Delete, Put, Post } from './decorator/verb';

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

  @Post('/mangas')
  async createManga(
    @Res() res: Response,
    @BodyField('mangaId') mangaId: string,
    @BodyField('providerId') providerId: string,
    @BodyField('sourceMangaId') sourceMangaId: string,
    @BodyField('keepAfterCompleted') keepAfterCompleted: boolean
  ) {
    await this.service.createManga(
      mangaId,
      providerId,
      sourceMangaId,
      keepAfterCompleted
    );
    return res.status(200);
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

  @Post('/mangas/:mangaId/source')
  async createMangaSource(
    @Res() res: Response,
    @Param('mangaId') mangaId: string,
    @BodyField('providerId') providerId: string,
    @BodyField('sourceMangaId') sourceMangaId: string,
    @BodyField('keepAfterCompleted') keepAfterCompleted: boolean
  ) {
    await this.service.createMangaSource(
      mangaId,
      providerId,
      sourceMangaId,
      keepAfterCompleted
    );
    return res.status(200);
  }

  @Delete('/mangas/:mangaId/source')
  async deleteMangaSource(
    @Res() res: Response,
    @Param('mangaId') mangaId: string
  ) {
    await this.service.deleteMangaSource(mangaId);
    return res.status(200);
  }

  @Post('/mangas/:mangaId/source/sync')
  async syncMangaSource(
    @Res() res: Response,
    @Param('mangaId') mangaId: string
  ) {
    await this.service.syncMangaSource(mangaId);
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
      collectionId ?? '',
      chapterId ?? ''
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
      collectionId ?? '',
      chapterId ?? '',
      imageId
    );
    return image.pipe(res.type(image.mime));
  }
}
