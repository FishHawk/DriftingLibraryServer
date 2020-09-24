import { Response } from 'express';

import { DownloadService } from '../service/service.download';

import { ControllerAdapter } from './adapter';
import { NotFoundError, ConflictError, BadRequestError } from './exception';

import { Get, Patch, Post, Delete } from './decorator/action';
import { Res, Body, Param } from './decorator/param';
import { DownloadDesc } from '../database/entity';

export class DownloadController extends ControllerAdapter {
  protected readonly prefix = '/download';
  constructor(private readonly downloadService: DownloadService) {
    super();
  }

  @Get('/list')
  getAllDownloadTask(@Res() res: Response) {
    return this.downloadService.getAllDownloadTask().then(res.json);
  }

  @Patch('/list/start')
  async startAllDownloadTask(@Res() res: Response) {
    return this.downloadService
      .startAllDownloadTask()
      .then(this.downloadService.getAllDownloadTask)
      .then(res.json);
  }

  @Patch('/list/pause')
  pauseAllDownloadTask(@Res() res: Response) {
    return this.downloadService
      .pauseAllDownloadTask()
      .then(this.downloadService.getAllDownloadTask)
      .then(res.json);
  }

  @Post('/item')
  createDownloadTask(
    @Res() res: Response,
    @Body('providerId') providerId: string,
    @Body('sourceManga') sourceManga: string,
    @Body('targetManga') targetManga: string
  ) {
    return this.downloadService
      .createDownloadTask(providerId, sourceManga, targetManga)
      .then((result) => result.whenFail(this.handleCreateFail))
      .then(res.json);
  }

  @Delete('/item/:id')
  deleteDownloadTask(@Res() res: Response, @Param('id') id: string) {
    return this.downloadService
      .deleteDownloadTask(id)
      .then(this.handleAccessFail)
      .then(res.json);
  }

  @Patch('/item/:id/start')
  startDownloadTask(@Res() res: Response, @Param('id') id: string) {
    return this.downloadService
      .startDownloadTask(id)
      .then(this.handleAccessFail)
      .then(res.json);
  }

  @Patch('/item/:id/pause')
  pauseDownloadTask(@Res() res: Response, @Param('id') id: string) {
    return this.downloadService
      .pauseDownloadTask(id)
      .then(this.handleAccessFail)
      .then(res.json);
  }

  /* handle failure */
  private handleCreateFail(f: DownloadService.CreateFail): never {
    if (f === DownloadService.CreateFail.UnsupportedProvider)
      throw new BadRequestError('Illegal error: target manga id');
    if (f === DownloadService.CreateFail.IlligalTargetMangaId)
      throw new BadRequestError('Illegal error: target manga id');
    if (f === DownloadService.CreateFail.MangaAlreadyExist)
      throw new ConflictError('Already exist: target manga');
    if (f === DownloadService.CreateFail.TaskAlreadyExist)
      throw new ConflictError('Already exist: download task');
    throw new Error();
  }

  private handleAccessFail(v: DownloadDesc | undefined): DownloadDesc {
    if (v === undefined) throw new NotFoundError('Not found: download task');
    return v;
  }
}
