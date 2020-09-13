import express, { Request, Response } from 'express';
import multer from 'multer';

import { DownloadService } from '../download/service.download';
import { SubscriptionService } from '../download/service.subscription';
import { AccessorLibrary, AccessorLibraryFailure } from '../library/accessor.library';
import { AccessorMangaFailure } from '../library/accessor.manga';

import { ControllerAdapter } from './adapter';
import { BadRequestError, NotFoundError } from './exception';

import { Get, Delete, Patch } from './decorator/action';
import { UseBefore } from './decorator/middleware';
import { Req, Res, Query, Param, RawBody } from './decorator/param';

const upload = multer({ storage: multer.memoryStorage() });

export class ControllerLibrary extends ControllerAdapter {
  constructor(
    private readonly library: AccessorLibrary,
    private readonly downloadService: DownloadService,
    private readonly subscriptionService: SubscriptionService
  ) {
    super();
    this.router.use(
      '/library/image',
      express.static(this.library.dir, {
        dotfiles: 'ignore',
        fallthrough: false,
      })
    );
  }

  @Get('/library/search')
  search(
    @Res() res: Response,
    @Query('lastTime') lastTime: number,
    @Query('limit') limit: number,
    @Query('keywords') keywords: string
  ) {
    return this.library
      .search(lastTime, limit, keywords)
      .then((outlines) => res.json(outlines));
  }

  @Get('/library/manga/:mangaId')
  getManga(@Res() res: Response, @Param('mangaId') mangaId: string) {
    return this.library
      .openManga(mangaId)
      .then((result) => result.onFailure(this.libraryFailureHandler))
      .then((manga) => manga.getMangaDetail())
      .then((detail) => res.json(detail));
  }

  @Delete('/library/manga/:mangaId')
  deleteManga(@Res() res: Response, @Param('mangaId') mangaId: string) {
    return this.library
      .deleteManga(mangaId)
      .then((result) => result.onFailure(this.libraryFailureHandler))
      .then(() => this.subscriptionService.deleteSubscriptionByMangaId(mangaId))
      .then(() => this.downloadService.deleteDownloadTaskByMangaId(mangaId))
      .then(() => res.json(mangaId));
  }

  @Patch('/library/manga/:mangaId/metadata')
  patchMangaMetadata(
    @Res() res: Response,
    @Param('mangaId') mangaId: string,
    @RawBody() body: any
  ) {
    return this.library
      .openManga(mangaId)
      .then((result) => result.onFailure(this.libraryFailureHandler))
      .then((manga) => manga.setMetadata(body))
      .then((manga) => manga.getMangaDetail())
      .then((detail) => res.json(detail));
  }

  @UseBefore(upload.single('thumb'))
  @Patch('/library/manga/:mangaId/thumb')
  patchMangaThumb(
    @Res() res: Response,
    @Req() req: Request,
    @Param('mangaId') mangaId: string
  ) {
    if (req.file === undefined) throw new BadRequestError('Illegal argument: thumb file');
    return this.library
      .openManga(mangaId)
      .then((result) => result.onFailure(this.libraryFailureHandler))
      .then((manga) => manga.setThumb(req.file.buffer))
      .then((manga) => manga.getMangaDetail())
      .then((detail) => res.json(detail));
  }

  @Get('/library/chapter/:mangaId')
  getChapter(
    @Res() res: Response,
    @Param('mangaId') mangaId: string,
    @Query('collection') collectionId: string,
    @Query('chapter') chapterId: string
  ) {
    return this.library
      .openManga(mangaId)
      .then((result) => result.onFailure(this.libraryFailureHandler))
      .then((manga) => manga.openChapter(collectionId, chapterId))
      .then((result) => result.onFailure(this.mangaFailureHandler))
      .then((chapter) => chapter.listImage())
      .then((content) => res.json(content));
  }

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
