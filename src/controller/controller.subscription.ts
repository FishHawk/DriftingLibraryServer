import { Request, Response } from 'express';

import { SubscriptionService } from '../download/service.subscription';

import { ControllerAdapter } from './adapter';
import { NotFoundError, ConflictError } from './exception';
import { Get, Patch, Post, Delete } from './decorator/action';
import { getIntParam, getStringBodyField } from './decorator/param';

export class ControllerSubscription extends ControllerAdapter {
  constructor(private readonly subscribeService: SubscriptionService) {
    super();
  }

  @Get('/subscriptions')
  getAllSubscription(_: Request, res: Response) {
    return this.subscribeService
      .getAllSubscription()
      .then((subscriptions) => res.json(subscriptions));
  }

  @Patch('/subscriptions/enable')
  enableAllSubscription(_: Request, res: Response) {
    return this.subscribeService
      .enableAllSubscription()
      .then(this.subscribeService.getAllSubscription)
      .then((subscriptions) => res.json(subscriptions));
  }

  @Patch('/subscriptions/disable')
  disableAllSubscription(_: Request, res: Response) {
    return this.subscribeService
      .disableAllSubscription()
      .then(this.subscribeService.getAllSubscription)
      .then((subscriptions) => res.json(subscriptions));
  }

  @Post('/subscription')
  createSubscription(req: Request, res: Response) {
    const providerId = getStringBodyField(req, 'providerId');
    const sourceManga = getStringBodyField(req, 'sourceManga');
    const targetManga = getStringBodyField(req, 'targetManga');
    return this.subscribeService
      .createSubscription(providerId, sourceManga, targetManga)
      .then((subscription) => {
        if (subscription === undefined) throw new ConflictError('Already exists.');
        return res.json(subscription);
      });
  }

  @Delete('/subscription/:id')
  deleteSubscription(req: Request, res: Response) {
    const id = getIntParam(req, 'id');
    return this.subscribeService.deleteSubscription(id).then((subscription) => {
      if (subscription === undefined) throw new NotFoundError('Not found.');
      return res.json(subscription);
    });
  }

  @Patch('/subscription/:id/enable')
  enableSubscription(req: Request, res: Response) {
    const id = getIntParam(req, 'id');
    return this.subscribeService.enableSubscription(id).then((subscription) => {
      if (subscription === undefined) throw new NotFoundError('Not found.');
      return res.json(subscription);
    });
  }

  @Patch('/subscription/:id/disable')
  disableSubscription(req: Request, res: Response) {
    const id = getIntParam(req, 'id');
    return this.subscribeService.disableSubscription(id).then((subscription) => {
      if (subscription === undefined) throw new NotFoundError('Not found.');
      return res.json(subscription);
    });
  }
}
