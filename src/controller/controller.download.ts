import { Response } from 'express';

import { DownloadService } from '../service/service.download';

import { ControllerAdapter } from './adapter';
import { NotFoundError, ConflictError, BadRequestError } from './exception';

import { Get, Patch, Post, Delete } from './decorator/action';
import { Res, Body, Param } from './decorator/param';

export class DownloadController extends ControllerAdapter {
  constructor(private readonly downloadService: DownloadService) {
    super();
  }

  @Get('/downloads')
  getAllDownloadTask(@Res() res: Response) {
    return this.downloadService.getAllDownloadTask().then((tasks) => res.json(tasks));
  }

  @Patch('/downloads/start')
  async startAllDownloadTask(@Res() res: Response) {
    return this.downloadService
      .startAllDownloadTask()
      .then(this.downloadService.getAllDownloadTask)
      .then((tasks) => res.json(tasks));
  }

  @Patch('/downloads/pause')
  pauseAllDownloadTask(@Res() res: Response) {
    return this.downloadService
      .pauseAllDownloadTask()
      .then(this.downloadService.getAllDownloadTask)
      .then((tasks) => res.json(tasks));
  }

  @Post('/download')
  createDownloadTask(
    @Res() res: Response,
    @Body('providerId') providerId: string,
    @Body('sourceManga') sourceManga: string,
    @Body('targetManga') targetManga: string
  ) {
    return this.downloadService
      .createDownloadTask(providerId, sourceManga, targetManga)
      .then((result) => result.whenFail(this.handleCreateFail))
      .then((task) => res.json(task));
  }

  @Delete('/download/:id')
  deleteDownloadTask(@Res() res: Response, @Param('id') id: string) {
    this.downloadService
      .deleteDownloadTask(id)
      .then((result) => result.whenFail(this.handleAccessFail))
      .then((task) => res.json(task));
  }

  @Patch('/download/:id/start')
  startDownloadTask(@Res() res: Response, @Param('id') id: string) {
    return this.downloadService
      .startDownloadTask(id)
      .then((result) => result.whenFail(this.handleAccessFail))
      .then((task) => res.json(task));
  }

  @Patch('/download/:id/pause')
  pauseDownloadTask(@Res() res: Response, @Param('id') id: string) {
    this.downloadService
      .pauseDownloadTask(id)
      .then((result) => result.whenFail(this.handleAccessFail))
      .then((task) => res.json(task));
  }

  /*
   * Handle failure
   */

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

  private handleAccessFail(f: DownloadService.AccessFail): never {
    if (f === DownloadService.AccessFail.TaskNotFound)
      throw new NotFoundError('Not found: download task');
    throw new Error();
  }
}
