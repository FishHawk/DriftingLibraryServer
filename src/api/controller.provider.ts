import { Response } from 'express';

import { ProviderService } from '@service/service.provider';

import { Controller } from './decorator/controller';
import { Res, Param, Query } from './decorator/parameter';
import { Get } from './decorator/verb';

@Controller('/providers')
export class ProviderController {
  constructor(private readonly service: ProviderService) {}

  @Get('/')
  listProvider(@Res() res: Response) {
    const providers = this.service.listProvider();
    return res.json(providers);
  }

  @Get('/:providerId')
  getProvider(@Res() res: Response, @Param('providerId') providerId: string) {
    const providerDetail = this.service.getProvider(providerId);
    return res.json(providerDetail);
  }

  @Get('/:providerId/icon')
  getProviderIcon(
    @Res() res: Response,
    @Param('providerId') providerId: string
  ) {
    const icon = this.service.getProviderIcon(providerId);
    return icon.pipe(res.type(icon.mime));
  }

  @Get('/:providerId/popular')
  async listPopularManga(
    @Res() res: Response,
    @Param('providerId') providerId: string,
    @Query('page') page: number,
    @Query() option: any
  ) {
    const mangas = await this.service.listPopularManga(
      providerId,
      page,
      option
    );
    return res.json(mangas);
  }

  @Get('/:providerId/latest')
  async listLatestManga(
    @Res() res: Response,
    @Param('providerId') providerId: string,
    @Query('page') page: number,
    @Query() option: any
  ) {
    const mangas = await this.service.listLatestManga(providerId, page, option);
    return res.json(mangas);
  }

  @Get('/:providerId/category')
  async listCategoryManga(
    @Res() res: Response,
    @Param('providerId') providerId: string,
    @Query('page') page: number,
    @Query() option: any
  ) {
    const mangas = await this.service.listCategoryManga(
      providerId,
      page,
      option
    );
    return res.json(mangas);
  }

  @Get('/:providerId/mangas')
  async listManga(
    @Res() res: Response,
    @Param('providerId') providerId: string,
    @Query('keywords') keywords: string,
    @Query('page') page: number
  ) {
    const mangas = await this.service.listManga(providerId, keywords, page);
    return res.json(mangas);
  }

  @Get('/:providerId/mangas/:mangaId')
  async getManga(
    @Res() res: Response,
    @Param('providerId') providerId: string,
    @Param('mangaId') mangaId: string
  ) {
    const manga = await this.service.getManga(providerId, mangaId);
    return res.json(manga);
  }

  @Get('/:providerId/mangas/:mangaId/chapters/:chapterId')
  async getChapter(
    @Res() res: Response,
    @Param('providerId') providerId: string,
    @Param('mangaId') mangaId: string,
    @Param('chapterId') chapterId: string
  ) {
    const chapter = await this.service.getChapter(
      providerId,
      mangaId,
      chapterId
    );
    return res.json(chapter);
  }

  @Get('/:providerId/images/:url')
  async getImage(
    @Res() res: Response,
    @Param('providerId') providerId: string,
    @Param('url') url: string
  ) {
    const image = await this.service.getImage(providerId, url);
    if (image.contentLength != 0)
      res.set({ 'Content-Length': image.contentLength });
    return image.pipe(res.type(image.mime));
  }
}
