import { Request, Response } from 'express';

import { SubscribeService } from '../download/service.subscribe';
import { ProviderManager } from '../provider/manager';

import { ControllerAdapter } from './adapter';
import { check } from './validators';
import { BadRequestError, NotFoundError, ConflictError } from './exceptions';
import { ProviderAdapter } from '../provider/adapter';

export class ControllerSubscription extends ControllerAdapter {
  constructor(
    private readonly providerManager: ProviderManager,
    private readonly subscribeService: SubscribeService
  ) {
    super();

    this.router.get('/subscriptions', this.wrap(this.getAllSubscription));
    this.router.patch('/subscriptions/enable', this.wrap(this.enableAllSubscription));
    this.router.patch('/subscriptions/disable', this.wrap(this.disableAllSubscription));

    this.router.post('/subscription', this.wrap(this.postSubscription));
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

  async postSubscription(req: Request, res: Response) {
    const source = this.checkProviderId(req.body.source);
    const sourceManga = this.checkSourceMangaId(req.body.sourceManga);
    const targetManga = this.checkTargetMangaId(req.body.targetManga);

    const subscription = await this.subscribeService.createSubscription(
      source,
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

  private checkProvider(id: any): ProviderAdapter {
    const checkedId = this.checkProviderId(id);
    const provider = this.providerManager.getProvider(checkedId);
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
