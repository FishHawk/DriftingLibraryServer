import { Request, Response } from 'express';

import { DownloadService } from '../download/service.download';
import { ProviderManager } from '../provider/manager';
import { ProviderAdapter } from '../provider/adapter';

import { ControllerAdapter } from './adapter';
import { BadRequestError, NotFoundError, ConflictError } from './exceptions';
import { check } from './validators';

export class ControllerDownload extends ControllerAdapter {
  constructor(
    private readonly providerManager: ProviderManager,
    private readonly downloadService: DownloadService
  ) {
    super();

    this.router.get('/downloads', this.wrap(this.getAllDownloadTask));
    this.router.patch('/downloads/start', this.wrap(this.startAllDownloadTask));
    this.router.patch('/downloads/pause', this.wrap(this.pauseAllDownloadTask));

    this.router.post('/download', this.wrap(this.createDownloadTask));
    this.router.delete('/download/:id', this.wrap(this.deleteDownloadTask));
    this.router.patch('/download/:id/start', this.wrap(this.startDownloadTask));
    this.router.patch('/download/:id/pause', this.wrap(this.pauseDownloadTask));
  }

  getAllDownloadTask = async (req: Request, res: Response) => {
    const tasks = await this.downloadService.getAllDownloadTask();
    return res.json(tasks);
  };

  startAllDownloadTask = async (req: Request, res: Response) => {
    await this.downloadService.startAllDownloadTask();
    const tasks = await this.downloadService.getAllDownloadTask();
    return res.json(tasks);
  };

  pauseAllDownloadTask = async (req: Request, res: Response) => {
    await this.downloadService.pauseAllDownloadTask();
    const tasks = await this.downloadService.getAllDownloadTask();
    return res.json(tasks);
  };

  createDownloadTask = async (req: Request, res: Response) => {
    const providerId = this.checkProviderId(req.body.providerId);
    const sourceManga = this.checkSourceMangaId(req.body.sourceManga);
    const targetManga = this.checkTargetMangaId(req.body.targetManga);
    this.checkProvider(providerId);

    const task = await this.downloadService.createDownloadTask(
      providerId,
      sourceManga,
      targetManga
    );
    if (task === undefined) throw new ConflictError('Already exists.');

    return res.json(task);
  };

  deleteDownloadTask = async (req: Request, res: Response) => {
    const id = this.checkDownloadId(req.params.id);

    const task = await this.downloadService.deleteDownloadTask(id);
    if (task === undefined) throw new NotFoundError('Not found.');
    return res.json(task);
  };

  startDownloadTask = async (req: Request, res: Response) => {
    const id = this.checkDownloadId(req.params.id);

    const task = await this.downloadService.startDownloadTask(id);
    if (task === undefined) throw new NotFoundError('Not found.');
    return res.json(task);
  };

  pauseDownloadTask = async (req: Request, res: Response) => {
    const id = this.checkDownloadId(req.params.id);

    const task = await this.downloadService.pauseDownloadTask(id);
    if (task === undefined) throw new NotFoundError('Not found.');
    return res.json(task);
  };

  /*
   * Argument validation helper
   */

  private checkDownloadId(id: any): number {
    const checked = check(id)?.isString()?.toInt()?.to();
    if (checked === undefined) throw new BadRequestError('Illegal argument: download id');
    return checked;
  }

  private checkProviderId(id: any): string {
    const checked = check(id)?.isString()?.to();
    if (checked === undefined) throw new BadRequestError('Illegal argument: provider id');
    return checked;
  }

  private checkProvider(id: string): ProviderAdapter {
    const provider = this.providerManager.getProvider(id);
    if (provider === undefined) throw new BadRequestError('Unsupport provider');
    return provider;
  }

  private checkSourceMangaId(id: any): string {
    const checked = check(id).isString()?.to();
    if (checked === undefined) throw new BadRequestError('Illegal argument: source manga id');
    return checked;
  }

  private checkTargetMangaId(id: any): string {
    const checked = check(id).isString()?.isFilename()?.to();
    if (checked === undefined) throw new BadRequestError('Illegal argument: target manga id');
    return checked;
  }
}
