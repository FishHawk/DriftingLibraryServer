import { Request, Response, static as staticService } from 'express';

import { DatabaseAdapter } from '../db/db_adapter';
import { LibraryAdapter } from '../library/library_adapter';

import { ControllerAdapter } from './adapter';
import { check, checkString } from './validators';
import { BadRequestError, NotFoundError } from './exceptions';

export class LibraryController extends ControllerAdapter {
  readonly db: DatabaseAdapter;
  readonly library: LibraryAdapter;

  constructor(db: DatabaseAdapter, library: LibraryAdapter) {
    super();
    this.db = db;
    this.library = library;

    this.router.get('/library/search', this.wrap(this.search));

    this.router.get('/library/manga/:id', this.wrap(this.getManga));
    this.router.delete('/library/manga/:id', this.wrap(this.deleteManga));

    this.router.get('/library/chapter/:id', this.wrap(this.getChapter));
    this.router.use(
      '/library/image',
      this.wrap((req, res, next) => {
        staticService(this.library.libraryDir)(req, res, next);
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
    const id = checkString(req.params.id).custom(this.library.validateMangaId)?.to();
    if (id === undefined) throw new BadRequestError('Illegal argument: id');

    const detail = await this.library.getMangaDetail(id);
    if (detail === undefined) throw new NotFoundError('Not found: manga');

    return res.json(detail);
  }

  async deleteManga(req: Request, res: Response) {
    const id = checkString(req.params.id).custom(this.library.validateMangaId)?.to();
    if (id === undefined) throw new BadRequestError('Illegal argument: id');

    if (!(await this.library.isMangaExist(id))) throw new NotFoundError('Not found: manga');

    await this.library.deleteManga(id!);
    await this.db.downloadChapterTaskRepository.delete({ targetManga: id });
    await this.db.downloadTaskRepository.delete({ targetManga: id });
    await this.db.subscriptionRepository.delete({ targetManga: id });
    return res.json(id);
  }

  async getChapter(req: Request, res: Response) {
    const id = checkString(req.params.id).custom(this.library.validateMangaId)?.to();
    const collectionId = check(req.query.collection).isString()?.to();
    const chapterId = check(req.query.chapter).isString()?.to();

    if (id === undefined) throw new BadRequestError('Illegal argument: id');
    if (collectionId === undefined) throw new BadRequestError('Illegal argument: collectionId');
    if (chapterId === undefined) throw new BadRequestError('Illegal argument: chapterId');

    const content = this.library.getChapterContent(id, collectionId, chapterId);
    if (content === null) throw new NotFoundError('Not found: chapter');

    return res.json(content);
  }
}
