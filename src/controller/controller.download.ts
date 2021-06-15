import { Response } from 'express';

import { DownloadService } from '../service/service.download';

import { Controller } from './decorator/controller';
import { Res, BodyField, Param, Query } from './decorator/parameter';
import { Get, Post, Delete } from './decorator/verb';

@Controller('/downloads')
export class DownloadController {
  constructor(private readonly downloadService: DownloadService) {}

  @Post('/')
  async createDownloadTask(
    @Res() res: Response,
    @BodyField('providerId') providerId: string,
    @BodyField('sourceManga') sourceManga: string,
    @BodyField('targetManga') targetManga: string,
    @Query('shouldCreateSubscription') shouldCreateSubscription: boolean
  ) {
    const task = await this.downloadService.createDownloadTask(
      providerId,
      sourceManga,
      targetManga,
      shouldCreateSubscription
    );
    return res.json(task);
  }
}
