import { Request, Response } from 'express';

import { DownloadService } from '../download/service.download';
import { ProviderManager } from '../provider/manager';
import { ProviderAdapter } from '../provider/adapter';
import { isObject, isString } from '../util/sanitizer';

import { ControllerAdapter } from './adapter';
import { BadRequestError, NotFoundError, ConflictError } from './exception';
import { extractIntParam } from './extarct';
import { Get, Patch, Post, Delete } from './decorator';

export class ControllerDownload extends ControllerAdapter {
  constructor(
    private readonly providerManager: ProviderManager,
    private readonly downloadService: DownloadService
  ) {
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
    if (!this.bodySanitize(req.body)) return new BadRequestError('Illegal body');
    this.checkProvider(req.body.providerId);

    return this.downloadService
      .createDownloadTask(req.body.providerId, req.body.sourceManga, req.body.targetManga)
      .then((task) => {
        if (task === undefined) throw new ConflictError('Already exists.');
        return res.json(task);
      });
  }

  @Delete('/download/:id')
  deleteDownloadTask(req: Request, res: Response) {
    const id = extractIntParam(req, 'id');
    this.downloadService.deleteDownloadTask(id).then((task) => {
      if (task === undefined) throw new NotFoundError('Not found.');
      return res.json(task);
    });
  }

  @Patch('/download/:id/start')
  startDownloadTask(req: Request, res: Response) {
    const id = extractIntParam(req, 'id');
    return this.downloadService.startDownloadTask(id).then((task) => {
      if (task === undefined) throw new NotFoundError('Not found.');
      return res.json(task);
    });
  }

  @Patch('/download/:id/pause')
  pauseDownloadTask(req: Request, res: Response) {
    const id = extractIntParam(req, 'id');
    this.downloadService.pauseDownloadTask(id).then((task) => {
      if (task === undefined) throw new NotFoundError('Not found.');
      return res.json(task);
    });
  }

  /*
   * Body validation helper
   */

  private readonly bodySanitize = isObject({
    providerId: isString(),
    sourceManga: isString(),
    targetManga: isString(),
  });

  // TODO: should not be here
  private checkProvider(id: string): ProviderAdapter {
    const provider = this.providerManager.getProvider(id);
    if (provider === undefined) throw new BadRequestError('Unsupport provider');
    return provider;
  }
}
