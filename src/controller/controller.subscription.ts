import { Request, Response } from 'express';

import { SubscriptionService } from '../download/service.subscription';
import { ProviderAdapter } from '../provider/adapter';
import { ProviderManager } from '../provider/manager';

import { ControllerAdapter } from './adapter';
import { BadRequestError, NotFoundError, ConflictError } from './exceptions';
import { check } from './validators';

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

  async getAllSubscription(req: Request, res: Response) {
    const subscriptions = await this.subscribeService.getAllSubscription();
    return res.json(subscriptions);
  }

  async enableAllSubscription(req: Request, res: Response) {
    await this.subscribeService.enableAllSubscription();
    const subscriptions = await this.subscribeService.getAllSubscription();
    return res.json(subscriptions);
  }

  async disableAllSubscription(req: Request, res: Response) {
    await this.subscribeService.disableAllSubscription();
    const subscriptions = await this.subscribeService.getAllSubscription();
    return res.json(subscriptions);
  }

  async createSubscription(req: Request, res: Response) {
    const providerId = this.checkProviderId(req.body.providerId);
    const sourceManga = this.checkSourceMangaId(req.body.sourceManga);
    const targetManga = this.checkTargetMangaId(req.body.targetManga);
    this.checkProvider(providerId);

    const subscription = await this.subscribeService.createSubscription(
      providerId,
      sourceManga,
      targetManga
    );
    if (subscription === undefined) throw new ConflictError('Already exists.');

    return res.json(subscription);
  }

  async deleteSubscription(req: Request, res: Response) {
    const id = this.checkSubscriptionId(req.params.id);

    const subscription = await this.subscribeService.deleteSubscription(id);
    if (subscription === undefined) throw new NotFoundError('Not found.');

    return res.json(subscription);
  }

  async enableSubscription(req: Request, res: Response) {
    const id = this.checkSubscriptionId(req.params.id);

    const subscription = await this.subscribeService.enableSubscription(id);
    if (subscription === undefined) throw new NotFoundError('Not found.');

    return res.json(subscription);
  }

  async disableSubscription(req: Request, res: Response) {
    const id = this.checkSubscriptionId(req.params.id);

    const subscription = await this.subscribeService.disableSubscription(id);
    if (subscription === undefined) throw new NotFoundError('Not found.');

    return res.json(subscription);
  }

  /*
   * Argument validation helper
   */

  private checkSubscriptionId(id: any): number {
    const checked = check(id)?.isString()?.toInt()?.to();
    if (checked === undefined) throw new BadRequestError('Illegal argument: subscription id');
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
