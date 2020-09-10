import { Request, Response } from 'express';

import { ProviderAdapter } from '../provider/adapter';
import { ProviderManager } from '../provider/manager';

import { ControllerAdapter } from './adapter';
import { BadRequestError } from './exception';
import { extractStringParam, extractStringQuery, extractIntQuery } from './extarct';

export class ControllerProvider extends ControllerAdapter {
  constructor(private readonly providerManager: ProviderManager) {
    super();

    this.router.get('/providers', this.wrap(this.getProviders));
    this.router.get('/provider/:providerId/search', this.wrap(this.search));
    this.router.get('/provider/:providerId/popular', this.wrap(this.getPopular));
    this.router.get('/provider/:providerId/latest', this.wrap(this.getLatest));

    this.router.get('/provider/:providerId/manga/:mangaId', this.wrap(this.getManga));
    this.router.get(
      '/provider/:providerId/chapter/:mangaId/:chapterId',
      this.wrap(this.getChapter)
    );
    this.router.get('/provider/:providerId/image/:url', this.wrap(this.getImage));
  }

  getProviders = async (req: Request, res: Response) => {
    const providers = this.providerManager.getProviderInfoList();
    return res.json(providers);
  };

  search = async (req: Request, res: Response) => {
    const provider = this.getProvider(req);
    const keywords = extractStringQuery(req, 'keywords');
    const page = extractIntQuery(req, 'page');

    const outlines = await provider.search(page, keywords);
    return res.json(outlines);
  };

  getPopular = async (req: Request, res: Response) => {
    const provider = this.getProvider(req);
    const page = extractIntQuery(req, 'page');

    const outlines = await provider.requestPopular(page);
    return res.json(outlines);
  };

  getLatest = async (req: Request, res: Response) => {
    const provider = this.getProvider(req);
    const page = extractIntQuery(req, 'page');

    const outlines = await provider.requestLatest(page);
    return res.json(outlines);
  };

  getManga = async (req: Request, res: Response) => {
    const provider = this.getProvider(req);
    const mangaId = extractStringParam(req, 'mangaId');

    const detail = await provider.requestMangaDetail(mangaId);
    return res.json(detail);
  };

  getChapter = async (req: Request, res: Response) => {
    const provider = this.getProvider(req);
    const mangaId = extractStringParam(req, 'mangaId');
    const chapterId = extractStringParam(req, 'chapterId');

    const imageUrls = await provider.requestChapterContent(mangaId, chapterId);
    return res.json(imageUrls);
  };

  getImage = async (req: Request, res: Response) => {
    const provider = this.getProvider(req);
    const url = extractStringParam(req, 'url');

    const image = await provider.requestImage(url);
    return res.send(image);
  };

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
