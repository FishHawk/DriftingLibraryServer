import { Request, Response, NextFunction, RequestHandler } from 'express';

import { SubscriptionService } from '../download/service.subscription';
import { ProviderAdapter } from '../provider/adapter';
import { ProviderManager } from '../provider/manager';
import { isString, isObject } from '../util/sanitizer';

import { ControllerAdapter } from './adapter';
import { BadRequestError, NotFoundError, ConflictError } from './exception';
import { extractIntParam } from './extarct';
import { Get, Patch, Post, Delete } from './decorator/action';

export class ControllerSubscription extends ControllerAdapter {
  constructor(
    private readonly providerManager: ProviderManager,
    private readonly subscribeService: SubscriptionService
  ) {
    super();
  }

  @Get('/subscriptions')
  getAllSubscription(req: Request, res: Response) {
    return this.subscribeService
      .getAllSubscription()
      .then((subscriptions) => res.json(subscriptions));
  }

  @Patch('/subscriptions/enable')
  enableAllSubscription(req: Request, res: Response) {
    return this.subscribeService
      .enableAllSubscription()
      .then(this.subscribeService.getAllSubscription)
      .then((subscriptions) => res.json(subscriptions));
  }

  @Patch('/subscriptions/disable')
  disableAllSubscription(req: Request, res: Response) {
    return this.subscribeService
      .disableAllSubscription()
      .then(this.subscribeService.getAllSubscription)
      .then((subscriptions) => res.json(subscriptions));
  }

  @Post('/subscription')
  createSubscription(req: Request, res: Response) {
    if (!this.bodySanitizer(req.body)) return new BadRequestError('Illegal body');
    this.checkProvider(req.body.providerId);

    return this.subscribeService
      .createSubscription(req.body.providerId, req.body.sourceManga, req.body.targetManga)
      .then((subscription) => {
        if (subscription === undefined) throw new ConflictError('Already exists.');
        return res.json(subscription);
      });
  }

  @Delete('/subscription/:id')
  deleteSubscription(req: Request, res: Response) {
    const id = extractIntParam(req, 'id');

    return this.subscribeService.deleteSubscription(id).then((subscription) => {
      if (subscription === undefined) throw new NotFoundError('Not found.');
      return res.json(subscription);
    });
  }

  @Patch('/subscription/:id/enable')
  enableSubscription(req: Request, res: Response) {
    const id = extractIntParam(req, 'id');

    return this.subscribeService.enableSubscription(id).then((subscription) => {
      if (subscription === undefined) throw new NotFoundError('Not found.');
      return res.json(subscription);
    });
  }

  @Patch('/subscription/:id/disable')
  disableSubscription(req: Request, res: Response) {
    const id = extractIntParam(req, 'id');

    return this.subscribeService.disableSubscription(id).then((subscription) => {
      if (subscription === undefined) throw new NotFoundError('Not found.');
      return res.json(subscription);
    });
  }

  /*
   * Argument validation helper
   */

  private readonly bodySanitizer = isObject({
    providerId: isString(),
    sourceManga: isString(),
    targetManga: isString(),
  });

  private checkProvider(id: string): ProviderAdapter {
    const provider = this.providerManager.getProvider(id);
    if (provider === undefined) throw new BadRequestError('Unsupport provider');
    return provider;
  }
}
