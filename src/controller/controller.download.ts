import { Request, Response } from 'express';

import { DownloadService } from '../download/service.download';

import { ControllerAdapter } from './adapter';
import { NotFoundError, ConflictError } from './exception';
import { Get, Patch, Post, Delete } from './decorator/action';
import { getIntParam, getStringBodyField } from './decorator/param';

export class ControllerDownload extends ControllerAdapter {
  constructor(private readonly downloadService: DownloadService) {
    super();
  }

  @Get('/downloads')
  getAllDownloadTask(req: Request, res: Response) {
    return this.downloadService.getAllDownloadTask().then((tasks) => res.json(tasks));
  }

  @Patch('/downloads/start')
  async startAllDownloadTask(req: Request, res: Response) {
    return this.downloadService
      .startAllDownloadTask()
      .then(this.downloadService.getAllDownloadTask)
      .then((tasks) => res.json(tasks));
  }

  @Patch('/downloads/pause')
  pauseAllDownloadTask(req: Request, res: Response) {
    return this.downloadService
      .pauseAllDownloadTask()
      .then(this.downloadService.getAllDownloadTask)
      .then((tasks) => res.json(tasks));
  }

  @Post('/download')
  createDownloadTask(req: Request, res: Response) {
    const providerId = getStringBodyField(req, 'providerId');
    const sourceManga = getStringBodyField(req, 'sourceManga');
    const targetManga = getStringBodyField(req, 'targetManga');
    return this.downloadService
      .createDownloadTask(providerId, sourceManga, targetManga)
      .then((task) => {
        if (task === undefined) throw new ConflictError('Already exists.');
        return res.json(task);
      });
  }

  @Delete('/download/:id')
  deleteDownloadTask(req: Request, res: Response) {
    const id = getIntParam(req, 'id');
    this.downloadService.deleteDownloadTask(id).then((task) => {
      if (task === undefined) throw new NotFoundError('Not found.');
      return res.json(task);
    });
  }

  @Patch('/download/:id/start')
  startDownloadTask(req: Request, res: Response) {
    const id = getIntParam(req, 'id');
    return this.downloadService.startDownloadTask(id).then((task) => {
      if (task === undefined) throw new NotFoundError('Not found.');
      return res.json(task);
    });
  }

  @Patch('/download/:id/pause')
  pauseDownloadTask(req: Request, res: Response) {
    const id = getIntParam(req, 'id');
    this.downloadService.pauseDownloadTask(id).then((task) => {
      if (task === undefined) throw new NotFoundError('Not found.');
      return res.json(task);
    });
  }
}
