import { Request, Response, NextFunction, RequestHandler } from 'express';

import { SubscriptionService } from '../download/service.subscription';
import { ProviderAdapter } from '../provider/adapter';
import { ProviderManager } from '../provider/manager';

import { ControllerAdapter } from './adapter';
import { BadRequestError, NotFoundError, ConflictError } from './exception';
import { isString, isObject } from '../util/sanitizer';
import { extractIntParam } from './extarct';

export class ControllerSubscription extends ControllerAdapter {
  constructor(
    private readonly providerManager: ProviderManager,
    private readonly subscribeService: SubscriptionService
  ) {
    super();

    this.router.get('/subscriptions', this.wrap(this.getAllSubscription));
    this.router.patch('/subscriptions/enable', this.wrap(this.enableAllSubscription));
    this.router.patch('/subscriptions/disable', this.wrap(this.disableAllSubscription));

    this.router.post('/subscription', this.wrap(this.createSubscription));
    this.router.delete('/subscription/:id', this.wrap(this.deleteSubscription));
    this.router.patch('/subscription/:id/enable', this.wrap(this.enableSubscription));
    this.router.patch('/subscription/:id/disable', this.wrap(this.disableSubscription));
  }

  getAllSubscription = async (req: Request, res: Response) => {
    const subscriptions = await this.subscribeService.getAllSubscription();
    return res.json(subscriptions);
  };

  enableAllSubscription = async (req: Request, res: Response) => {
    await this.subscribeService.enableAllSubscription();
    const subscriptions = await this.subscribeService.getAllSubscription();
    return res.json(subscriptions);
  };

  disableAllSubscription = async (req: Request, res: Response) => {
    await this.subscribeService.disableAllSubscription();
    const subscriptions = await this.subscribeService.getAllSubscription();
    return res.json(subscriptions);
  };

  createSubscription = async (req: Request, res: Response) => {
    if (!this.bodySanitizer(req.body)) return new BadRequestError('Illegal body');
    this.checkProvider(req.body.providerId);

    const subscription = await this.subscribeService.createSubscription(
      req.body.providerId,
      req.body.sourceManga,
      req.body.targetManga
    );
    if (subscription === undefined) throw new ConflictError('Already exists.');

    return res.json(subscription);
  };

  deleteSubscription = async (req: Request, res: Response) => {
    const id = extractIntParam(req, 'id');
    const subscription = await this.subscribeService.deleteSubscription(id);
    if (subscription === undefined) throw new NotFoundError('Not found.');

    return res.json(subscription);
  };

  enableSubscription = async (req: Request, res: Response) => {
    const id = extractIntParam(req, 'id');
    const subscription = await this.subscribeService.enableSubscription(id);
    if (subscription === undefined) throw new NotFoundError('Not found.');

    return res.json(subscription);
  };

  disableSubscription = async (req: Request, res: Response) => {
    const id = extractIntParam(req, 'id');
    const subscription = await this.subscribeService.disableSubscription(id);
    if (subscription === undefined) throw new NotFoundError('Not found.');

    return res.json(subscription);
  };

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
