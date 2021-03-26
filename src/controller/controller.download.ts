import { Response } from 'express';

import { DownloadService } from '../service/service.download';

import { Controller } from './decorator/controller';
import { Res, BodyField, Param } from './decorator/parameter';
import { Get, Patch, Post, Delete } from './decorator/verb';
import { ConflictError, BadRequestError, assertExist } from './exception';

@Controller('/downloads')
export class DownloadController {
  constructor(private readonly downloadService: DownloadService) {}

  @Get('/')
  async listDownloadTask(@Res() res: Response) {
    const tasks = await this.downloadService.getAllDownloadTask();
    return res.json(tasks);
  }

  @Patch('/start')
  async startAllDownloadTask(@Res() res: Response) {
    await this.downloadService.startAllDownloadTask();
    const tasks = await this.downloadService.getAllDownloadTask();
    return res.json(tasks);
  }

  @Patch('/pause')
  async pauseAllDownloadTask(@Res() res: Response) {
    await this.downloadService.pauseAllDownloadTask();
    const tasks = await this.downloadService.getAllDownloadTask();
    return res.json(tasks);
  }

  @Post('/')
  async createDownloadTask(
    @Res() res: Response,
    @BodyField('providerId') providerId: string,
    @BodyField('sourceManga') sourceManga: string,
    @BodyField('targetManga') targetManga: string
  ) {
    const taskOrFail = await this.downloadService.createDownloadTask(
      providerId,
      sourceManga,
      targetManga
    );
    const task = taskOrFail.whenFail(this.handleCreateFail);
    return res.json(task);
  }

  @Delete('/:id')
  async deleteDownloadTask(@Res() res: Response, @Param('id') id: string) {
    const task = await this.downloadService.deleteDownloadTask(id);
    assertExist(task, 'download task');
    return res.json(task);
  }

  @Patch('/:id/start')
  async startDownloadTask(@Res() res: Response, @Param('id') id: string) {
    const task = await this.downloadService.startDownloadTask(id);
    assertExist(task, 'download task');
    return res.json(task);
  }

  @Patch('/:id/pause')
  async pauseDownloadTask(@Res() res: Response, @Param('id') id: string) {
    const task = await this.downloadService.pauseDownloadTask(id);
    assertExist(task, 'download task');
    return res.json(task);
  }

  /* handle failure */
  private handleCreateFail(f: DownloadService.CreateFail): never {
    if (f === DownloadService.CreateFail.UnsupportedProvider)
      throw new BadRequestError('Illegal error: target manga id');
    if (f === DownloadService.CreateFail.IlligalTargetMangaId)
      throw new BadRequestError('Illegal error: target manga id');
    if (f === DownloadService.CreateFail.TaskAlreadyExist)
      throw new ConflictError('Already exist: download task');
    throw new Error();
  }
}
