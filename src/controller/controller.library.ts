import { Request, Response, static as staticService } from 'express';

import { DatabaseAdapter } from '../db/db_adapter';
import { AccessorLibrary } from '../library/accessor.library';

import { ControllerAdapter } from './adapter';
import { check, checkString } from './validators';
import { BadRequestError, NotFoundError } from './exceptions';

export class ControllerLibrary extends ControllerAdapter {
  constructor(private readonly db: DatabaseAdapter, private readonly library: AccessorLibrary) {
    super();

    this.router.get('/library/search', this.wrap(this.search));

    this.router.get('/library/manga/:id', this.wrap(this.getManga));
    this.router.delete('/library/manga/:id', this.wrap(this.deleteManga));

    this.router.get('/library/chapter/:id', this.wrap(this.getChapter));
    // TODO
    this.router.use(
      '/library/image',
      this.wrap((req, res, next) => {
        staticService(this.library.dir)(req, res, next);
      })
    );
  }

  async search(req: Request, res: Response) {
    const lastTime = check(req.query.lastTime).setDefault('0').isString()?.toInt()?.min(0).to();
    const limit = check(req.query.limit).setDefault('20').isString()?.toInt()?.limit(0, 20).to();
    const keywords = check(req.query.keywords).setDefault('').isString()?.to();

    if (lastTime === undefined) throw new BadRequestError('Illegal argument: lastTime');
    if (limit === undefined) throw new BadRequestError('Illegal argument: limit');
    if (keywords === undefined) throw new BadRequestError('Illegal argument: keywords');

    const outlines = await this.library.search(lastTime, limit, keywords);
    return res.json(outlines);
  }

  async getManga(req: Request, res: Response) {
    const id = checkString(req.params.id).isFilename()?.to();
    if (id === undefined) throw new BadRequestError('Illegal argument: id');

    const manga = await this.library.openManga(id);
    const detail = await manga?.parseMangaDetail();
    if (detail === undefined) throw new NotFoundError('Not found: manga');

    return res.json(detail);
  }

  async deleteManga(req: Request, res: Response) {
    const id = checkString(req.params.id).isFilename()?.to();
    if (id === undefined) throw new BadRequestError('Illegal argument: id');

    if (!(await this.library.isMangaExist(id))) throw new NotFoundError('Not found: manga');
    await this.library.deleteManga(id!);

    await this.db.downloadChapterTaskRepository.delete({ targetManga: id });
    await this.db.downloadTaskRepository.delete({ targetManga: id });
    await this.db.subscriptionRepository.delete({ targetManga: id });
    return res.json(id);
  }

  async getChapter(req: Request, res: Response) {
    const id = checkString(req.params.id).isFilename()?.to();
    const collectionId = check(req.query.collection).isString()?.to();
    const chapterId = check(req.query.chapter).isString()?.to();

    if (id === undefined) throw new BadRequestError('Illegal argument: id');
    if (collectionId === undefined) throw new BadRequestError('Illegal argument: collectionId');
    if (chapterId === undefined) throw new BadRequestError('Illegal argument: chapterId');

    const manga = await this.library.openManga(id);
    const chapter = await manga?.openChapter(collectionId, chapterId);
    const content = chapter?.listImage();
    if (content === undefined) throw new NotFoundError('Not found: chapter');

    return res.json(content);
  }
}
