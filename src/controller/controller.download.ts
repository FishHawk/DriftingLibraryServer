import { Response } from 'express';

import { DownloadService } from '../service/service.download';

import { Controller } from './decorator/controller';
import { Res, BodyField, Param } from './decorator/parameter';
import { Get, Post, Delete } from './decorator/verb';

@Controller('/downloads')
export class DownloadController {
  constructor(private readonly downloadService: DownloadService) {}

  @Get('/')
  async listDownloadTask(@Res() res: Response) {
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
    const task = await this.downloadService.createDownloadTask(
      providerId,
      sourceManga,
      targetManga
    );
    return res.json(task);
  }

  @Delete('/:id')
  async deleteDownloadTask(@Res() res: Response, @Param('id') id: string) {
    const task = await this.downloadService.deleteDownloadTask(id);
    return res.json(task);
  }
}
