import { Request, Response, static as staticService } from 'express';

import { DownloadService } from '../download/service';

import { ControllerAdapter } from './adapter';
import { check, checkString } from './validators';
import { BadRequestError, NotFoundError, ConflictError } from './exceptions';

export class ControllerDownload extends ControllerAdapter {
  constructor(private readonly downloadService: DownloadService) {
    super();

    this.router.get('/downloads', this.wrap(this.getAllDownloadTask));
    this.router.patch('/downloads/start', this.wrap(this.startAllDownloadTask));
    this.router.patch('/downloads/pause', this.wrap(this.pauseAllDownloadTask));

    this.router.post('/download', this.wrap(this.createDownloadTask));
    this.router.delete('/download/:id', this.wrap(this.deleteDownloadTask));
    this.router.patch('/download/:id/start', this.wrap(this.startDownloadTask));
    this.router.patch('/download/:id/pause', this.wrap(this.pauseDownloadTask));
  }

  async getAllDownloadTask(req: Request, res: Response) {
    const tasks = await this.downloadService.getAllDownloadTask();
    return res.json(tasks);
  }

  async startAllDownloadTask(req: Request, res: Response) {
    await this.downloadService.startAllDownloadTask();
    const tasks = await this.downloadService.getAllDownloadTask();
    return res.json(tasks);
  }

  async pauseAllDownloadTask(req: Request, res: Response) {
    await this.downloadService.pauseAllDownloadTask();
    const tasks = await this.downloadService.getAllDownloadTask();
    return res.json(tasks);
  }

  async createDownloadTask(req: Request, res: Response) {
    const source = check(req.body.source).isString()?.to();
    const sourceManga = check(req.body.sourceManga).isString()?.to();
    const targetManga = check(req.body.targetManga).isString()?.isFilename()?.to();

    if (source === undefined) throw new BadRequestError('Arguments are illegal.');
    if (sourceManga === undefined) throw new BadRequestError('Arguments are illegal.');
    if (targetManga === undefined) throw new BadRequestError('Arguments are illegal.');

    const task = await this.downloadService.createDownloadTask(source, sourceManga, targetManga);
    if (task === undefined) throw new ConflictError('Already exists.');

    return res.json(task);
  }

  async deleteDownloadTask(req: Request, res: Response) {
    const id = checkString(req.params.id).toInt()?.to();
    if (id === undefined) throw new BadRequestError('Arguments are illegal.');

    const task = await this.downloadService.deleteDownloadTask(id);
    if (task === undefined) throw new NotFoundError('Not found.');
    return res.json(task);
  }

  async startDownloadTask(req: Request, res: Response) {
    const id = checkString(req.params.id).toInt()?.to();
    if (id === undefined) throw new BadRequestError('Arguments are illegal.');

    const task = await this.downloadService.startDownloadTask(id);
    if (task === undefined) throw new NotFoundError('Not found.');
    return res.json(task);
  }

  async pauseDownloadTask(req: Request, res: Response) {
    const id = checkString(req.params.id).toInt()?.to();
    if (id === undefined) throw new BadRequestError('Arguments are illegal.');

    const task = await this.downloadService.pauseDownloadTask(id);
    if (task === undefined) throw new NotFoundError('Not found.');
    return res.json(task);
  }
}
