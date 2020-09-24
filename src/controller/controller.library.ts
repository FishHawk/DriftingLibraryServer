import express, { Request, Response } from 'express';
import multer from 'multer';

import { DownloadService } from '../service/service.download';
import { SubscriptionService } from '../service/service.subscription';
import { LibraryAccessor } from '../library/accessor.library';

import { ControllerAdapter } from './adapter';
import { BadRequestError, NotFoundError } from './exception';

import { Get, Delete, Patch } from './decorator/action';
import { UseBefore } from './decorator/middleware';
import { Req, Res, Query, Param, RawBody } from './decorator/param';

const upload = multer({ storage: multer.memoryStorage() });

export class LibraryController extends ControllerAdapter {
  protected readonly prefix = '/library';
  constructor(
    private readonly library: LibraryAccessor,
    private readonly downloadService: DownloadService,
    private readonly subscriptionService: SubscriptionService
  ) {
    super();
    this.router.use(
      '/image',
      express.static(this.library.dir, {
        dotfiles: 'ignore',
        fallthrough: false,
      })
    );
  }

  @Get('/search')
  search(
    @Res() res: Response,
    @Query('lastTime') lastTime: number,
    @Query('limit') limit: number,
    @Query('keywords') keywords: string
  ) {
    return this.library.search(lastTime, limit, keywords).then(res.json);
  }

  @Get('/manga/:mangaId')
  getManga(@Res() res: Response, @Param('mangaId') mangaId: string) {
    return this.library
      .getManga(mangaId)
      .then(this.handleMangaAccessFail)
      .then((manga) => manga.getDetail())
      .then(res.json);
  }

  @Delete('/manga/:mangaId')
  deleteManga(@Res() res: Response, @Param('mangaId') mangaId: string) {
    return this.library
      .deleteManga(mangaId)
      .then(this.handleMangaAccessFail)
      .then(() => this.subscriptionService.deleteSubscription(mangaId))
      .then(() => this.downloadService.deleteDownloadTask(mangaId))
      .then(() => res.json(mangaId));
  }

  @Patch('/manga/:mangaId/metadata')
  patchMangaMetadata(
    @Res() res: Response,
    @Param('mangaId') mangaId: string,
    @RawBody() body: any
  ) {
    return this.library
      .getManga(mangaId)
      .then(this.handleMangaAccessFail)
      .then((manga) => manga.setMetadata(body))
      .then((manga) => manga.getDetail())
      .then(res.json);
  }

  @UseBefore(upload.single('thumb'))
  @Patch('/manga/:mangaId/thumb')
  patchMangaThumb(
    @Res() res: Response,
    @Req() req: Request,
    @Param('mangaId') mangaId: string
  ) {
    if (req.file === undefined)
      throw new BadRequestError('Illegal argument: thumb file');
    return this.library
      .getManga(mangaId)
      .then(this.handleMangaAccessFail)
      .then((manga) => manga.setThumb(req.file.buffer))
      .then((manga) => manga.getDetail())
      .then(res.json);
  }

  @Get('/chapter/:mangaId')
  getChapter(
    @Res() res: Response,
    @Param('mangaId') mangaId: string,
    @Query('collection') collectionId: string,
    @Query('chapter') chapterId: string
  ) {
    return this.library
      .getManga(mangaId)
      .then(this.handleMangaAccessFail)
      .then((manga) => manga.getChapter(collectionId, chapterId))
      .then(this.handleChapterAccessFail)
      .then((chapter) => chapter.listImage())
      .then(res.json);
  }

  /* handle failure */
  private handleMangaAccessFail<T>(v: T | undefined): T {
    if (v === undefined) throw new NotFoundError('Not found: manga');
    return v;
  }

  private handleChapterAccessFail<T>(v: T | undefined): T {
    if (v === undefined) throw new NotFoundError('Not found: chapter');
    return v;
  }
}
