import { Response } from 'express';

import { DownloadService } from '../download/service.download';

import { ControllerAdapter } from './adapter';
import { NotFoundError, ConflictError } from './exception';

import { Get, Patch, Post, Delete } from './decorator/action';
import { Res, Body, Param } from './decorator/param';

export class ControllerDownload extends ControllerAdapter {
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
      .then((task) => {
        if (task === undefined) throw new ConflictError('Already exists.');
        return res.json(task);
      });
  }

  @Delete('/download/:id')
  deleteDownloadTask(@Res() res: Response, @Param('id') id: number) {
    this.downloadService.deleteDownloadTask(id).then((task) => {
      if (task === undefined) throw new NotFoundError('Not found.');
      return res.json(task);
    });
  }

  @Patch('/download/:id/start')
  startDownloadTask(@Res() res: Response, @Param('id') id: number) {
    return this.downloadService.startDownloadTask(id).then((task) => {
      if (task === undefined) throw new NotFoundError('Not found.');
      return res.json(task);
    });
  }

  @Patch('/download/:id/pause')
  pauseDownloadTask(@Res() res: Response, @Param('id') id: number) {
    this.downloadService.pauseDownloadTask(id).then((task) => {
      if (task === undefined) throw new NotFoundError('Not found.');
      return res.json(task);
    });
  }
}
