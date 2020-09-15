import { Response } from 'express';

import { ProviderAdapter } from '../provider/providers/adapter';
import { ProviderManager } from '../provider/manager';

import { ControllerAdapter } from './adapter';
import { BadRequestError } from './exception';

import { Get } from './decorator/action';
import { Res, Param, Query } from './decorator/param';

export class ProviderController extends ControllerAdapter {
  constructor(private readonly providerManager: ProviderManager) {
    super();
  }

  @Get('/providers')
  getProviders(@Res() res: Response) {
    const providers = this.providerManager.getProviderInfoList();
    return res.json(providers);
  }

  @Get('/provider/:providerId/search')
  search(
    @Res() res: Response,
    @Param('providerId') providerId: string,
    @Query('keywords') keywords: string,
    @Query('page') page: number
  ) {
    return this.getProvider(providerId)
      .search(page, keywords)
      .then((outlines) => res.json(outlines));
  }

  @Get('/provider/:providerId/popular')
  getPopular(
    @Res() res: Response,
    @Param('providerId') providerId: string,
    @Query('page') page: number
  ) {
    return this.getProvider(providerId)
      .requestPopular(page)
      .then((outlines) => res.json(outlines));
  }

  @Get('/provider/:providerId/latest')
  getLatest(
    @Res() res: Response,
    @Param('providerId') providerId: string,
    @Query('page') page: number
  ) {
    return this.getProvider(providerId)
      .requestLatest(page)
      .then((outlines) => res.json(outlines));
  }

  @Get('/provider/:providerId/manga/:mangaId')
  getManga(
    @Res() res: Response,
    @Param('providerId') providerId: string,
    @Param('mangaId') mangaId: string
  ) {
    return this.getProvider(providerId)
      .requestMangaDetail(mangaId)
      .then((detail) => res.json(detail));
  }

  @Get('/provider/:providerId/chapter/:mangaId/:chapterId')
  getChapter(
    @Res() res: Response,
    @Param('providerId') providerId: string,
    @Param('mangaId') mangaId: string,
    @Param('chapterId') chapterId: string
  ) {
    return this.getProvider(providerId)
      .requestChapterContent(mangaId, chapterId)
      .then((content) => res.json(content));
  }

  @Get('/provider/:providerId/image/:url')
  getImage(
    @Res() res: Response,
    @Param('providerId') providerId: string,
    @Param('url') url: string
  ) {
    return this.getProvider(providerId)
      .requestImage(url)
      .then((image) => res.send(image));
  }

  /*
   * Argument validation helper
   */

  private getProvider(id: string): ProviderAdapter {
    const provider = this.providerManager.getProvider(id);
    if (provider === undefined)
      throw new BadRequestError('Illegal param: unsupport provider');
    return provider;
  }
}
