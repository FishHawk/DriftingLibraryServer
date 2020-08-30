import { Request, Response } from 'express';

import { ProviderManager } from '../provider/manager';
import { ProviderAdapter } from '../provider/adapter';

import { ControllerAdapter } from './adapter';
import { check } from './validators';
import { BadRequestError } from './exceptions';

export class ControllerProvider extends ControllerAdapter {
  constructor(private readonly providerManager: ProviderManager) {
    super();

    this.router.get('/sources', this.wrap(this.getProviders));
    this.router.get('/source/:source/search', this.wrap(this.search));
    this.router.get('/source/:source/popular', this.wrap(this.getPopular));
    this.router.get('/source/:source/latest', this.wrap(this.getLatest));

    this.router.get('/source/:source/manga/:id', this.wrap(this.getManga));
    this.router.get('/source/:source/chapter/:id', this.wrap(this.getChapter));
    this.router.get('/source/:source/image/:url', this.wrap(this.getImage));
  }

  async getProviders(req: Request, res: Response) {
    const providers = this.providerManager.getProviderInfoList();
    return res.json(providers);
  }

  async search(req: Request, res: Response) {
    const provider = this.checkProvider(req.query.provider);
    const keywords = this.checkKeywords(req.query.keywords);
    const page = this.checkPage(req.query.page);

    const outlines = await provider.search(page, keywords);
    return res.json(outlines);
  }

  async getPopular(req: Request, res: Response) {
    const provider = this.checkProvider(req.query.provider);
    const page = this.checkPage(req.query.page);

    const outlines = await provider.requestPopular(page);
    return res.json(outlines);
  }

  async getLatest(req: Request, res: Response) {
    const provider = this.checkProvider(req.query.provider);
    const page = this.checkPage(req.query.page);

    const outlines = await provider.requestLatest(page);
    return res.json(outlines);
  }

  async getManga(req: Request, res: Response) {
    const provider = this.checkProvider(req.query.provider);
    const id = this.checkMangaId(req.params.id);

    const detail = await provider.requestMangaDetail(id);
    return res.json(detail);
  }

  async getChapter(req: Request, res: Response) {
    const provider = this.checkProvider(req.params.provider);
    const id = this.checkChapterId(req.params.id);

    const imageUrls = await provider.requestChapterContent(id);
    const imageProxyUrls = imageUrls.map((x) => {
      return `source/${encodeURIComponent(provider.name)}/image/${encodeURIComponent(x)}`;
    });
    return res.json(imageProxyUrls);
  }

  async getImage(req: Request, res: Response) {
    const provider = this.checkProvider(req.params.provider);
    const url = req.params.url;

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
