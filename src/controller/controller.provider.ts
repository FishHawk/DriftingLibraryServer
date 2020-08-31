import { Request, Response } from 'express';

import { ProviderManager } from '../provider/manager';
import { ProviderAdapter } from '../provider/adapter';

import { ControllerAdapter } from './adapter';
import { check } from './validators';
import { BadRequestError } from './exceptions';

export class ControllerProvider extends ControllerAdapter {
  constructor(private readonly providerManager: ProviderManager) {
    super();

    this.router.get('/providers', this.wrap(this.getProviders));
    this.router.get('/provider/:providerId/search', this.wrap(this.search));
    this.router.get('/provider/:providerId/popular', this.wrap(this.getPopular));
    this.router.get('/provider/:providerId/latest', this.wrap(this.getLatest));

    this.router.get('/provider/:providerId/manga/:mangaId', this.wrap(this.getManga));
    this.router.get('/provider/:providerId/chapter/:chapterId', this.wrap(this.getChapter));
    this.router.get('/provider/:providerId/image/:url', this.wrap(this.getImage));
  }

  async getProviders(req: Request, res: Response) {
    const providers = this.providerManager.getProviderInfoList();
    return res.json(providers);
  }

  async search(req: Request, res: Response) {
    const provider = this.checkProvider(req.params.providerId);
    const keywords = this.checkKeywords(req.query.keywords);
    const page = this.checkPage(req.query.page);

    const outlines = await provider.search(page, keywords);
    return res.json(outlines);
  }

  async getPopular(req: Request, res: Response) {
    const provider = this.checkProvider(req.params.providerId);
    const page = this.checkPage(req.query.page);

    const outlines = await provider.requestPopular(page);
    return res.json(outlines);
  }

  async getLatest(req: Request, res: Response) {
    const provider = this.checkProvider(req.params.providerId);
    const page = this.checkPage(req.query.page);

    const outlines = await provider.requestLatest(page);
    return res.json(outlines);
  }

  async getManga(req: Request, res: Response) {
    const provider = this.checkProvider(req.params.providerId);
    const mangaId = this.checkMangaId(req.params.mangaId);

    const detail = await provider.requestMangaDetail(mangaId);
    return res.json(detail);
  }

  async getChapter(req: Request, res: Response) {
    const provider = this.checkProvider(req.params.providerId);
    const chapterId = this.checkChapterId(req.params.chapterId);

    const imageUrls = await provider.requestChapterContent(chapterId);
    const imageProxyUrls = imageUrls.map(
      (x) => `provider/${encodeURIComponent(provider.name)}/image/${encodeURIComponent(x)}`
    );
    return res.json(imageProxyUrls);
  }

  async getImage(req: Request, res: Response) {
    const provider = this.checkProvider(req.params.providerId);
    const url = this.checkImageUrl(req.params.url);

    const image = await provider.requestImage(url);
    // TODO: image type
  }

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
