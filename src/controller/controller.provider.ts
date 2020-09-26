import { Response } from 'express';

import { ProviderAdapter } from '../provider/providers/adapter';
import { ProviderManager } from '../provider/manager';

import { ControllerAdapter } from './adapter';
import { BadRequestError, NotFoundError } from './exception';

import { Get } from './decorator/action';
import { Res, Param, Query, RawQuery } from './decorator/param';

export class ProviderController extends ControllerAdapter {
  protected readonly prefix = '/provider';
  constructor(private readonly providerManager: ProviderManager) {
    super();
  }

  @Get('/list')
  getProviders(@Res() res: Response) {
    const providers = this.providerManager
      .getProviderList()
      .map((provider) => provider.getInfo());
    return res.json(providers);
  }

  @Get('/item/:providerId/detail')
  getProviderDetail(
    @Res() res: Response,
    @Param('providerId') providerId: string
  ) {
    const detail = this.getProvider(providerId).getDetail();
    return res.json(detail);
  }

  @Get('/item/:providerId/search')
  search(
    @Res() res: Response,
    @Param('providerId') providerId: string,
    @Query('keywords') keywords: string,
    @Query('page') page: number
  ) {
    return this.getProvider(providerId).search(page, keywords).then(res.json);
  }

  @Get('/item/:providerId/popular')
  getPopular(
    @Res() res: Response,
    @Param('providerId') providerId: string,
    @Query('page') page: number,
    @RawQuery() option: any
  ) {
    return this.getProvider(providerId)
      .requestPopular(page, option)
      .then(this.handleMangaListAccessFail)
      .then(res.json);
  }

  @Get('/item/:providerId/latest')
  getLatest(
    @Res() res: Response,
    @Param('providerId') providerId: string,
    @Query('page') page: number,
    @RawQuery() option: any
  ) {
    return this.getProvider(providerId)
      .requestLatest(page, option)
      .then(this.handleMangaListAccessFail)
      .then(res.json);
  }

  @Get('/item/:providerId/category')
  getCategory(
    @Res() res: Response,
    @Param('providerId') providerId: string,
    @Query('page') page: number,
    @RawQuery() option: any
  ) {
    return this.getProvider(providerId)
      .requestCategory(page, option)
      .then(this.handleMangaListAccessFail)
      .then(res.json);
  }

  @Get('/item/:providerId/manga/:mangaId')
  getManga(
    @Res() res: Response,
    @Param('providerId') providerId: string,
    @Param('mangaId') mangaId: string
  ) {
    return this.getProvider(providerId)
      .requestMangaDetail(mangaId)
      .then(res.json);
  }

  @Get('/item/:providerId/chapter/:mangaId/:chapterId')
  getChapter(
    @Res() res: Response,
    @Param('providerId') providerId: string,
    @Param('mangaId') mangaId: string,
    @Param('chapterId') chapterId: string
  ) {
    return this.getProvider(providerId)
      .requestChapterContent(mangaId, chapterId)
      .then(res.json);
  }

  @Get('/item/:providerId/image/:url')
  getImage(
    @Res() res: Response,
    @Param('providerId') providerId: string,
    @Param('url') url: string
  ) {
    return this.getProvider(providerId)
      .requestImage(url)
      .then((image) => res.type(image.mime).send(image.buffer));
  }

  /* validate argument */
  private getProvider(id: string): ProviderAdapter {
    const provider = this.providerManager.getProvider(id);
    if (provider === undefined)
      throw new BadRequestError('Illegal param: unsupport provider');
    return provider;
  }

  /* handle failure */
  private handleMangaListAccessFail<T>(v: T | undefined): T {
    if (v === undefined) throw new NotFoundError('Not found: manga list');
    return v;
  }
}
