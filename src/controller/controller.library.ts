import express, { Request, Response } from 'express';
import multer from 'multer';

import { DownloadService } from '../download/service.download';
import { SubscriptionService } from '../download/service.subscription';
import { AccessorLibrary } from '../library/accessor.library';

import { ControllerAdapter } from './adapter';
import { BadRequestError, NotFoundError } from './exception';
import { extractIntQuery, extractStringQuery, extractStringParam } from './extarct';

const upload = multer({ storage: multer.memoryStorage() });

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
    this.router.patch(
      '/library/manga/:id/thumb',
      upload.single('thumb'),
      this.wrap(this.patchMangaThumb)
    );
    this.router.patch('/library/manga/:id/metadata', this.wrap(this.patchMangaMetadata));

    this.router.get('/library/chapter/:id', this.wrap(this.getChapter));

    this.router.use(
      '/library/image',
      express.static(this.library.dir, { dotfiles: 'ignore', fallthrough: false })
    );
  }

  search = async (req: Request, res: Response) => {
    const lastTime = extractIntQuery(req, 'lastTime');
    const limit = extractIntQuery(req, 'limit', 20);
    const keywords = extractStringQuery(req, 'keywords');

    const outlines = await this.library.search(lastTime, limit, keywords);
    return res.json(outlines);
  };

  getManga = async (req: Request, res: Response) => {
    const id = extractStringParam(req, 'id');

    const manga = await this.library.openManga(id);
    const detail = await manga?.getMangaDetail();
    if (detail === undefined) throw new NotFoundError('Not found: manga');

    return res.json(detail);
  };

  deleteManga = async (req: Request, res: Response) => {
    const id = extractStringParam(req, 'id');

    if (!(await this.library.isMangaExist(id))) throw new NotFoundError('Not found: manga');
    await this.library.deleteManga(id!);

    await this.subscriptionService.deleteSubscriptionByMangaId(id);
    await this.downloadService.deleteDownloadTaskByMangaId(id);
    return res.json(id);
  };

  patchMangaThumb = async (req: Request, res: Response) => {
    const id = extractStringParam(req, 'id');
    if (req.file === undefined) throw new BadRequestError('Illegal argument: thumb file');

    const manga = await this.library.openManga(id);
    if (manga === undefined) throw new NotFoundError('Not found: manga');

    await manga.setThumb(req.file.buffer);
    const detail = await manga?.getMangaDetail();

    return res.json(detail);
  };

  patchMangaMetadata = async (req: Request, res: Response) => {
    const id = extractStringParam(req, 'id');

    const manga = await this.library.openManga(id);
    if (manga === undefined) throw new NotFoundError('Not found: manga');

    await manga.setMetadata(req.body);
    const detail = await manga?.getMangaDetail();

    return res.json(detail);
  };

  getChapter = async (req: Request, res: Response) => {
    const id = extractStringParam(req, 'id');
    const collectionId = extractStringQuery(req, 'collection');
    const chapterId = extractStringQuery(req, 'chapter');

    const manga = await this.library.openManga(id);
    const chapter = await manga?.openChapter(collectionId, chapterId);
    const content = await chapter?.listImage();
    if (content === undefined) throw new NotFoundError('Not found: chapter');

    return res.json(content);
  };
}
