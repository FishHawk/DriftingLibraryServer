import express, { Request, Response } from 'express';
import multer from 'multer';

import { DownloadService } from '../download/service.download';
import { SubscriptionService } from '../download/service.subscription';
import { AccessorLibrary, AccessorLibraryFailure } from '../library/accessor.library';

import { ControllerAdapter } from './adapter';
import { BadRequestError, NotFoundError } from './exception';
import { extractIntQuery, extractStringQuery, extractStringParam } from './extarct';
import { AccessorMangaFailure } from '../library/accessor.manga';

const upload = multer({ storage: multer.memoryStorage() });

export class ControllerLibrary extends ControllerAdapter {
  constructor(
    private readonly library: AccessorLibrary,
    private readonly downloadService: DownloadService,
    private readonly subscriptionService: SubscriptionService
  ) {
    super();

    this.router.get('/library/search', this.wrap(this.search));

    this.router.get('/library/manga/:mangaId', this.wrap(this.getManga));
    this.router.delete('/library/manga/:mangaId', this.wrap(this.deleteManga));
    this.router.patch('/library/manga/:mangaId/metadata', this.wrap(this.patchMangaMetadata));
    this.router.patch(
      '/library/manga/:mangaId/thumb',
      upload.single('thumb'),
      this.wrap(this.patchMangaThumb)
    );

    this.router.get('/library/chapter/:mangaId', this.wrap(this.getChapter));

    this.router.use(
      '/library/image',
      express.static(this.library.dir, { dotfiles: 'ignore', fallthrough: false })
    );
  }

  search = async (req: Request, res: Response) => {
    const lastTime = extractIntQuery(req, 'lastTime');
    const limit = extractIntQuery(req, 'limit', 20);
    const keywords = extractStringQuery(req, 'keywords');

    return this.library.search(lastTime, limit, keywords).then((outlines) => res.json(outlines));
  };

  getManga = async (req: Request, res: Response) => {
    const mangaId = extractStringParam(req, 'mangaId');
    return this.library
      .openManga(mangaId)
      .then((result) => result.onFailure(this.libraryFailureHandler))
      .then((manga) => manga.getMangaDetail())
      .then((detail) => res.json(detail));
  };

  deleteManga = async (req: Request, res: Response) => {
    const mangaId = extractStringParam(req, 'mangaId');
    return this.library
      .deleteManga(mangaId)
      .then((result) => result.onFailure(this.libraryFailureHandler))
      .then(() => this.subscriptionService.deleteSubscriptionByMangaId(mangaId))
      .then(() => this.downloadService.deleteDownloadTaskByMangaId(mangaId))
      .then(() => res.json(mangaId));
  };

  patchMangaMetadata = async (req: Request, res: Response) => {
    const mangaId = extractStringParam(req, 'mangaId');
    return this.library
      .openManga(mangaId)
      .then((result) => result.onFailure(this.libraryFailureHandler))
      .then((manga) => manga.setMetadata(req.body))
      .then((manga) => manga.getMangaDetail())
      .then((detail) => res.json(detail));
  };

  patchMangaThumb = async (req: Request, res: Response) => {
    const mangaId = extractStringParam(req, 'mangaId');
    if (req.file === undefined) throw new BadRequestError('Illegal argument: thumb file');

    return this.library
      .openManga(mangaId)
      .then((result) => result.onFailure(this.libraryFailureHandler))
      .then((manga) => manga.setThumb(req.file.buffer))
      .then((manga) => manga.getMangaDetail())
      .then((detail) => res.json(detail));
  };

  getChapter = async (req: Request, res: Response) => {
    const mangaId = extractStringParam(req, 'mangaId');
    const collectionId = extractStringQuery(req, 'collection');
    const chapterId = extractStringQuery(req, 'chapter');

    return this.library
      .openManga(mangaId)
      .then((result) => result.onFailure(this.libraryFailureHandler))
      .then((manga) => manga.openChapter(collectionId, chapterId))
      .then((result) => result.onFailure(this.mangaFailureHandler))
      .then((chapter) => chapter.listImage())
      .then((content) => res.json(content));
  };

  /*
   * Helper
   */

  private libraryFailureHandler(e: AccessorLibraryFailure): never {
    if (e === AccessorLibraryFailure.IllegalMangaId)
      throw new BadRequestError('Illegal error: manga id');
    else if (e === AccessorLibraryFailure.MangaNotFound)
      throw new NotFoundError('Not found: manga');
    throw new Error();
  }

  private mangaFailureHandler(e: AccessorMangaFailure): never {
    if (e === AccessorMangaFailure.IllegalCollectionId)
      throw new BadRequestError('Illegal error: collection id');
    else if (e === AccessorMangaFailure.IllegalChapterId)
      throw new BadRequestError('Illegal error: chapter id');
    else if (e === AccessorMangaFailure.ChapterNotFound)
      throw new NotFoundError('Not found: chapter');
    throw new Error();
  }
}
