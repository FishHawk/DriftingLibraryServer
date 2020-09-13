import { Response } from 'express';

import { SubscriptionService } from '../download/service.subscription';

import { ControllerAdapter } from './adapter';
import { NotFoundError, ConflictError } from './exception';
import { Get, Patch, Post, Delete } from './decorator/action';
import { Res, Body, Param } from './decorator/param';

export class ControllerSubscription extends ControllerAdapter {
  constructor(private readonly subscribeService: SubscriptionService) {
    super();
  }

  @Get('/subscriptions')
  getAllSubscription(@Res() res: Response) {
    return this.subscribeService
      .getAllSubscription()
      .then((subscriptions) => res.json(subscriptions));
  }

  @Patch('/subscriptions/enable')
  enableAllSubscription(@Res() res: Response) {
    return this.subscribeService
      .enableAllSubscription()
      .then(this.subscribeService.getAllSubscription)
      .then((subscriptions) => res.json(subscriptions));
  }

  @Patch('/subscriptions/disable')
  disableAllSubscription(@Res() res: Response) {
    return this.subscribeService
      .disableAllSubscription()
      .then(this.subscribeService.getAllSubscription)
      .then((subscriptions) => res.json(subscriptions));
  }

  @Post('/subscription')
  createSubscription(
    @Res() res: Response,
    @Body('providerId') providerId: string,
    @Body('sourceManga') sourceManga: string,
    @Body('targetManga') targetManga: string
  ) {
    return this.subscribeService
      .createSubscription(providerId, sourceManga, targetManga)
      .then((subscription) => {
        if (subscription === undefined) throw new ConflictError('Already exists.');
        return res.json(subscription);
      });
  }

  @Delete('/subscription/:id')
  deleteSubscription(@Res() res: Response, @Param('id') id: number) {
    return this.subscribeService.deleteSubscription(id).then((subscription) => {
      if (subscription === undefined) throw new NotFoundError('Not found.');
      return res.json(subscription);
    });
  }

  @Patch('/subscription/:id/enable')
  enableSubscription(@Res() res: Response, @Param('id') id: number) {
    return this.subscribeService.enableSubscription(id).then((subscription) => {
      if (subscription === undefined) throw new NotFoundError('Not found.');
      return res.json(subscription);
    });
  }

  @Patch('/subscription/:id/disable')
  disableSubscription(@Res() res: Response, @Param('id') id: number) {
    return this.subscribeService.disableSubscription(id).then((subscription) => {
      if (subscription === undefined) throw new NotFoundError('Not found.');
      return res.json(subscription);
    });
  }
}
