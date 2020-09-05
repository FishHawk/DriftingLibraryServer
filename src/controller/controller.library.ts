import express, { Request, Response } from 'express';

import { DownloadService } from '../download/service.download';
import { SubscriptionService } from '../download/service.subscription';
import { AccessorLibrary } from '../library/accessor.library';

import { ControllerAdapter } from './adapter';
import { BadRequestError, NotFoundError } from './exceptions';
import { check } from './validators';

export class ControllerLibrary extends ControllerAdapter {
  constructor(
    private readonly library: AccessorLibrary,
    private readonly downloadService: DownloadService,
    private readonly subscriptionService: SubscriptionService
  ) {
    super();

    this.router.get('/library/search', this.wrap(this.search));
    this.router.get('/library/manga/:id', this.wrap(this.getManga));
    this.router.delete('/library/manga/:id', this.wrap(this.deleteManga));
    this.router.get('/library/chapter/:id', this.wrap(this.getChapter));

    this.router.use(
      '/library/image',
      express.static(this.library.dir, { dotfiles: 'ignore', fallthrough: false })
    );
  }

  search = async (req: Request, res: Response) => {
    const lastTime = check(req.query.lastTime).isString()?.toInt()?.min(0).to();
    const limit = check(req.query.limit).setDefault('20').isString()?.toInt()?.limit(0, 20).to();
    const keywords = check(req.query.keywords).setDefault('').isString()?.to();

    if (limit === undefined) throw new BadRequestError('Illegal argument: limit');
    if (keywords === undefined) throw new BadRequestError('Illegal argument: keywords');

    const outlines = await this.library.search(lastTime, limit, keywords);
    return res.json(outlines);
  };

  getManga = async (req: Request, res: Response) => {
    const id = this.checkMangaId(req.params.id);

    const manga = await this.library.openManga(id);
    const detail = await manga?.getMangaDetail();
    if (detail === undefined) throw new NotFoundError('Not found: manga');

    return res.json(detail);
  };

  deleteManga = async (req: Request, res: Response) => {
    const id = this.checkMangaId(req.params.id);

    if (!(await this.library.isMangaExist(id))) throw new NotFoundError('Not found: manga');
    await this.library.deleteManga(id!);

    await this.subscriptionService.deleteSubscriptionByMangaId(id);
    await this.downloadService.deleteDownloadTaskByMangaId(id);
    return res.json(id);
  };

  getChapter = async (req: Request, res: Response) => {
    const id = this.checkMangaId(req.params.id);
    const collectionId = this.checkCollectionId(req.query.collection);
    const chapterId = this.checkChapterId(req.query.chapter);

    const manga = await this.library.openManga(id);
    const chapter = await manga?.openChapter(collectionId, chapterId);
    const content = await chapter?.listImage();
    if (content === undefined) throw new NotFoundError('Not found: chapter');

    return res.json(content);
  };

  /*
   * Argument validation helper
   */

  private checkMangaId(id: any): string {
    const checked = check(id).isString()?.isFilename()?.to();
    if (checked === undefined) throw new BadRequestError('Illegal argument: manga id');
    return checked;
  }

  private checkCollectionId(id: any): string {
    let checked = check(id).isString()?.isFilename()?.to();
    if (checked === undefined) checked = check(id).isString()?.isEmpty()?.to();
    if (checked === undefined) throw new BadRequestError('Illegal argument: collection id');
    return checked;
  }

  private checkChapterId(id: any): string {
    let checked = check(id).isString()?.isFilename()?.to();
    if (checked === undefined) checked = check(id).isString()?.isEmpty()?.to();
    if (checked === undefined) throw new BadRequestError('Illegal argument: chapter id');
    return checked;
  }
}
