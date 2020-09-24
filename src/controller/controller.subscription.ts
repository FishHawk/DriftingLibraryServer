import { Response } from 'express';

import { SubscriptionService } from '../service/service.subscription';

import { ControllerAdapter } from './adapter';
import { NotFoundError, ConflictError, BadRequestError } from './exception';

import { Get, Patch, Post, Delete } from './decorator/action';
import { Res, Body, Param } from './decorator/param';
import { Subscription } from '../database/entity';

export class SubscriptionController extends ControllerAdapter {
  protected readonly prefix = '/subscription';
  constructor(private readonly subscribeService: SubscriptionService) {
    super();
  }

  @Get('/list')
  getAllSubscription(@Res() res: Response) {
    return this.subscribeService
      .getAllSubscription()
      .then((subscriptions) => res.json(subscriptions));
  }

  @Patch('/list/enable')
  enableAllSubscription(@Res() res: Response) {
    return this.subscribeService
      .toggleAllSubscription(true)
      .then(this.subscribeService.getAllSubscription)
      .then((subscriptions) => res.json(subscriptions));
  }

  @Patch('/list/disable')
  disableAllSubscription(@Res() res: Response) {
    return this.subscribeService
      .toggleAllSubscription(false)
      .then(this.subscribeService.getAllSubscription)
      .then((subscriptions) => res.json(subscriptions));
  }

  @Post('/item')
  createSubscription(
    @Res() res: Response,
    @Body('providerId') providerId: string,
    @Body('sourceManga') sourceManga: string,
    @Body('targetManga') targetManga: string
  ) {
    return this.subscribeService
      .createSubscription(providerId, sourceManga, targetManga)
      .then((result) => result.whenFail(this.handleCreateFail))
      .then((subscription) => res.json(subscription));
  }

  @Delete('/item/:id')
  deleteSubscription(@Res() res: Response, @Param('id') id: string) {
    return this.subscribeService
      .deleteSubscription(id)
      .then(this.handleAccessFail)
      .then((subscription) => res.json(subscription));
  }

  @Patch('/item/:id/enable')
  enableSubscription(@Res() res: Response, @Param('id') id: string) {
    return this.subscribeService
      .toggleSubscription(id, true)
      .then(this.handleAccessFail)
      .then((subscription) => res.json(subscription));
  }

  @Patch('/item/:id/disable')
  disableSubscription(@Res() res: Response, @Param('id') id: string) {
    return this.subscribeService
      .toggleSubscription(id, false)
      .then(this.handleAccessFail)
      .then((subscription) => res.json(subscription));
  }

  /* handle failure */
  private handleCreateFail(f: SubscriptionService.CreateFail): never {
    if (f === SubscriptionService.CreateFail.UnsupportedProvider)
      throw new BadRequestError('Illegal error: target manga id');
    if (f === SubscriptionService.CreateFail.IlligalTargetMangaId)
      throw new BadRequestError('Illegal error: target manga id');
    if (f === SubscriptionService.CreateFail.MangaAlreadyExist)
      throw new ConflictError('Already exist: target manga');
    if (f === SubscriptionService.CreateFail.TaskAlreadyExist)
      throw new ConflictError('Already exist: download task');
    throw new Error();
  }

  private handleAccessFail(v: Subscription | undefined): Subscription {
    if (v === undefined) throw new NotFoundError('Not found: subscription');
    return v;
  }
}
