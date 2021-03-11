import express, { Request, Response } from 'express';
import multer from 'multer';

import { DownloadService } from '../service/service.download';
import { SubscriptionService } from '../service/service.subscription';
import { LibraryAccessor } from '../library/accessor.library';
import { Image } from '../util/fs';

import { ControllerAdapter } from './adapter';
import { BadRequestError, NotFoundError } from './exception';

import { Get, Delete, Patch } from './decorator/action';
import { UseBefore } from './decorator/middleware';
import { Req, Res, Query, Param, Body } from './decorator/param';
import { Readable } from 'typeorm/platform/PlatformTools';

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
    return this.library
      .search(lastTime, limit, keywords)
      .then((it) => res.json(it));
  }

  @Get('/manga/:mangaId')
  getManga(@Res() res: Response, @Param('mangaId') mangaId: string) {
    return this.library
      .getManga(mangaId)
      .then(this.handleMangaAccessFail)
      .then((manga) => {
        manga.removeNewMark();
        return manga.getDetail();
      })
      .then((it) => res.json(it));
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
    @Body() body: any
  ) {
    return this.library
      .getManga(mangaId)
      .then(this.handleMangaAccessFail)
      .then((manga) => manga.setMetadata(body))
      .then((manga) => manga.getDetail())
      .then((it) => res.json(it));
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
      .then((manga) => {
        const image = Image.fromMime(
          req.file.mimetype,
          Readable.from(req.file.buffer)
        );
        if (image === undefined)
          throw new BadRequestError('Illegal argument: thumb file');
        return manga.setThumb(image);
      })
      .then((manga) => manga.getDetail())
      .then((it) => res.json(it));
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
      .then((it) => res.json(it));
  }

  @Get('/image/:mangaId')
  getImage(
    @Res() res: Response,
    @Param('mangaId') mangaId: string,
    @Query('collection') collectionId: string,
    @Query('chapter') chapterId: string,
    @Query('image') imageFilename: string
  ) {
    return this.library
      .getManga(mangaId)
      .then(this.handleMangaAccessFail)
      .then((manga) => manga.getChapter(collectionId, chapterId))
      .then(this.handleChapterAccessFail)
      .then((chapter) => chapter.readImage(imageFilename))
      .then(this.handleImageAccessFail)
      .then((image) => image.pipe(res.type(image.mime)));
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

  private handleImageAccessFail<T>(v: T | undefined): T {
    if (v === undefined) throw new NotFoundError('Not found: image');
    return v;
  }
}
