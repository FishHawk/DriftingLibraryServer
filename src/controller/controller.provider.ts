import { Request, Response } from 'express';

import { ProviderAdapter } from '../provider/adapter';
import { ProviderManager } from '../provider/manager';

import { ControllerAdapter } from './adapter';
import { BadRequestError } from './exceptions';
import { check } from './validators';

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
    const provider = this.checkProvider(req.params.providerId);
    const keywords = this.checkKeywords(req.query.keywords);
    const page = this.checkPage(req.query.page);

    const outlines = await provider.search(page, keywords);
    return res.json(outlines);
  };

  getPopular = async (req: Request, res: Response) => {
    const provider = this.checkProvider(req.params.providerId);
    const page = this.checkPage(req.query.page);

    const outlines = await provider.requestPopular(page);
    return res.json(outlines);
  };

  getLatest = async (req: Request, res: Response) => {
    const provider = this.checkProvider(req.params.providerId);
    const page = this.checkPage(req.query.page);

    const outlines = await provider.requestLatest(page);
    return res.json(outlines);
  };

  getManga = async (req: Request, res: Response) => {
    const provider = this.checkProvider(req.params.providerId);
    const mangaId = this.checkMangaId(req.params.mangaId);

    const detail = await provider.requestMangaDetail(mangaId);
    return res.json(detail);
  };

  getChapter = async (req: Request, res: Response) => {
    const provider = this.checkProvider(req.params.providerId);
    const mangaId = this.checkMangaId(req.params.mangaId);
    const chapterId = this.checkChapterId(req.params.chapterId);

    const imageUrls = await provider.requestChapterContent(mangaId, chapterId);
    const imageProxyUrls = imageUrls.map(
      (x) => `provider/${encodeURIComponent(provider.name)}/image/${encodeURIComponent(x)}`
    );
    return res.json(imageProxyUrls);
  };

  getImage = async (req: Request, res: Response) => {
    const provider = this.checkProvider(req.params.providerId);
    const url = this.checkImageUrl(req.params.url);

    const image = await provider.requestImage(url);
    return res.send(image);
  };

  /*
   * Argument validation helper
   */

  private checkProviderId(id: any): string {
    const checked = check(id)?.isString()?.to();
    if (checked === undefined) throw new BadRequestError('Illegal argument: provider id');
    return checked;
  }

  private checkProvider(id: any): ProviderAdapter {
    const checkedId = this.checkProviderId(id);
    const provider = this.providerManager.getProvider(checkedId);
    if (provider === undefined) throw new BadRequestError('Unsupport provider');
    return provider;
  }

  private checkPage(page: any): number {
    const checked = check(page).setDefault('1').isString()?.toInt()?.min(1).to();
    if (checked === undefined) throw new BadRequestError('Illegal argument: page');
    return checked;
  }

  private checkKeywords(keywords: any): string {
    const checked = check(keywords).setDefault('').isString()?.to();
    if (checked === undefined) throw new BadRequestError('Illegal argument: keywords');
    return checked;
  }

  private checkMangaId(id: any): string {
    const checked = check(id).isString()?.to();
    if (checked === undefined) throw new BadRequestError('Illegal argument: manga id');
    return checked;
  }

  private checkChapterId(id: any): string {
    const checked = check(id).isString()?.to();
    if (checked === undefined) throw new BadRequestError('Illegal argument: chapter id');
    return checked;
  }

  private checkImageUrl(url: any): string {
    const checked = check(url).isString()?.to();
    if (checked === undefined) throw new BadRequestError('Illegal argument: image url');
    return checked;
  }
}
