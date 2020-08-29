import { Request, Response, static as staticService } from 'express';

import { DatabaseAdapter } from '../db/db_adapter';
import { LibraryAdapter } from '../library/adapter';

import { ControllerAdapter } from './adapter';
import { check, checkString } from './validators';
import { BadRequestError, NotFoundError } from './exceptions';
import { DownloadService } from '../service/service.download';
import { DownloadTaskStatus } from '../db/entity/download_task';

export class ControllerDownload extends ControllerAdapter {
  constructor(
    private readonly db: DatabaseAdapter,
    private readonly library: LibraryAdapter,
    private readonly downloadService: DownloadService
  ) {
    super();

    this.router.get('/downloads', this.wrap(this.getAllDownloadTask));
    this.router.patch('/downloads/start', this.wrap(this.startAllDownloadTask));
    this.router.patch('/downloads/pause', this.wrap(this.pauseAllDownloadTask));

    // this.router.post('/download', this.wrap(this.postDownloadTask));
    // this.router.delete('/download/:id', this.wrap(this.deleteDownloadTask));
    // this.router.patch('/download/:id/start', this.wrap(this.startDownloadTask));
    // this.router.patch('/download/:id/pause', this.wrap(this.pauseDownloadTask));
  }

  async getAllDownloadTask(req: Request, res: Response) {
    const tasks = await this.db.downloadTaskRepository.find();
    return res.json(tasks);
  }

  async startAllDownloadTask(req: Request, res: Response) {
    await this.db.downloadTaskRepository.update(
      { status: DownloadTaskStatus.Paused },
      { status: DownloadTaskStatus.Waiting }
    );

    await this.db.downloadTaskRepository.update(
      { status: DownloadTaskStatus.Error },
      { status: DownloadTaskStatus.Waiting }
    );

    const tasks = await this.db.downloadTaskRepository.find();
    this.downloadService.start();
    return res.json(tasks);
  }

  async pauseAllDownloadTask(req: Request, res: Response) {
    await this.db.downloadTaskRepository.update(
      { status: DownloadTaskStatus.Waiting },
      { status: DownloadTaskStatus.Paused }
    );

    await this.db.downloadTaskRepository.update(
      { status: DownloadTaskStatus.Downloading },
      { status: DownloadTaskStatus.Paused }
    );

    const tasks = await this.db.downloadTaskRepository.find();
    this.downloadService.cancelCurrentTask();
    return res.json(tasks);
  }

  // async postDownloadTask(req: Request, res: Response) {
  //   const source = req.body.source;
  //   const sourceManga = req.body.sourceManga;
  //   const targetManga = req.body.targetManga;

  //   if (source === undefined || sourceManga === undefined || !isMangaIdValid(targetManga))
  //     throw new BadRequestError('Arguments are illegal.');

  //   if (isMangaExist(targetManga)) throw new ConflictError('Already exists.');
  //   createManga(targetManga);

  //   const task = await DownloadTask.Model.create({
  //     source,
  //     sourceManga,
  //     targetManga,
  //     isCreatedBySubscription: false,
  //   });
  //   startDownloader();
  //   return res.json(task);
  // }

  // async deleteDownloadTask(req: Request, res: Response) {
  //   const id = Number.parseInt(req.params.id);

  //   if (!Number.isInteger(id)) throw new BadRequestError('Arguments are illegal.');

  //   const task = await DownloadTask.Model.findByPk(id);
  //   if (task === null) throw new NotFoundError('Not found.');

  //   if (!task.isCreatedBySubscription) {
  //     await DownloadChapterTask.Model.destroy({
  //       where: { targetManga: task.targetManga },
  //     });
  //   }
  //   await task.destroy();
  //   if (isMangaDownloading(task.targetManga)) cancelCurrentDownload();
  //   return res.json(task);
  // }

  // async startDownloadTask(req: Request, res: Response) {
  //   const id = Number.parseInt(req.params.id);

  //   if (!Number.isInteger(id)) throw new BadRequestError('Arguments are illegal.');

  //   const task = await DownloadTask.Model.findByPk(id);
  //   if (task === null) throw new NotFoundError('Not found.');

  //   if (task.status === DownloadTask.Status.PAUSED || task.status === DownloadTask.Status.ERROR) {
  //     await task.update({ status: DownloadTask.Status.WAITING });
  //   }
  //   startDownloader();
  //   return res.json(task);
  // }

  // async pauseDownloadTask(req: Request, res: Response) {
  //   const id = Number.parseInt(req.params.id);

  //   if (!Number.isInteger(id)) throw new BadRequestError('Arguments are illegal.');

  //   const task = await DownloadTask.Model.findByPk(id);
  //   if (task === null) throw new NotFoundError('Not found.');

  //   if (
  //     task.status === DownloadTask.Status.DOWNLOADING ||
  //     task.status === DownloadTask.Status.WAITING
  //   ) {
  //     await task.update({ status: DownloadTask.Status.PAUSED });
  //   }
  //   if (isMangaDownloading(task.targetManga)) cancelCurrentDownload();
  //   return res.json(task);
  // }
}
