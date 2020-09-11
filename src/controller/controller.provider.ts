import { Request, Response } from 'express';

import { ProviderAdapter } from '../provider/adapter';
import { ProviderManager } from '../provider/manager';

import { ControllerAdapter } from './adapter';
import { BadRequestError } from './exception';
import { extractStringParam, extractStringQuery, extractIntQuery } from './extarct';
import { Get } from './decorator';

export class ControllerProvider extends ControllerAdapter {
  constructor(private readonly providerManager: ProviderManager) {
    super();
  }

  @Get('/providers')
  getProviders(req: Request, res: Response) {
    const providers = this.providerManager.getProviderInfoList();
    return res.json(providers);
  }

  @Get('/provider/:providerId/search')
  search(req: Request, res: Response) {
    const provider = this.getProvider(req);
    const keywords = extractStringQuery(req, 'keywords');
    const page = extractIntQuery(req, 'page');
    return provider.search(page, keywords).then((outlines) => res.json(outlines));
  }

  @Get('/provider/:providerId/popular')
  getPopular(req: Request, res: Response) {
    const provider = this.getProvider(req);
    const page = extractIntQuery(req, 'page');
    return provider.requestPopular(page).then((outlines) => res.json(outlines));
  }

  @Get('/provider/:providerId/latest')
  getLatest(req: Request, res: Response) {
    const provider = this.getProvider(req);
    const page = extractIntQuery(req, 'page');
    return provider.requestLatest(page).then((outlines) => res.json(outlines));
  }

  @Get('/provider/:providerId/manga/:mangaId')
  getManga(req: Request, res: Response) {
    const provider = this.getProvider(req);
    const mangaId = extractStringParam(req, 'mangaId');
    return provider.requestMangaDetail(mangaId).then((detail) => res.json(detail));
  }

  @Get('/provider/:providerId/chapter/:mangaId/:chapterId')
  getChapter(req: Request, res: Response) {
    const provider = this.getProvider(req);
    const mangaId = extractStringParam(req, 'mangaId');
    const chapterId = extractStringParam(req, 'chapterId');
    return provider.requestChapterContent(mangaId, chapterId).then((content) => res.json(content));
  }

  @Get('/provider/:providerId/image/:url')
  getImage(req: Request, res: Response) {
    const provider = this.getProvider(req);
    const url = extractStringParam(req, 'url');
    return provider.requestImage(url).then((image) => res.send(image));
  }

  /*
   * Argument validation helper
   */

  private getProvider(req: Request): ProviderAdapter {
    const id = extractStringParam(req, 'providerId');
    const provider = this.providerManager.getProvider(id);
    if (provider === undefined) throw new BadRequestError('Illegal param: unsupport provider');
    return provider;
  }
}
