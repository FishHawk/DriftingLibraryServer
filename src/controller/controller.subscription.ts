import { Response } from 'express';

import { SubscriptionService } from '../service/service.subscription';

import { ControllerAdapter } from './adapter';
import { NotFoundError, ConflictError, BadRequestError } from './exception';
import { Get, Patch, Post, Delete } from './decorator/action';
import { Res, Body, Param } from './decorator/param';

export class SubscriptionController extends ControllerAdapter {
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
      .then((result) => result.whenFail(this.handleCreateFail))
      .then((subscription) => res.json(subscription));
  }

  @Delete('/subscription/:id')
  deleteSubscription(@Res() res: Response, @Param('id') id: number) {
    return this.subscribeService
      .deleteSubscription(id)
      .then((result) => result.whenFail(this.handleAccessFail))
      .then((subscription) => res.json(subscription));
  }

  @Patch('/subscription/:id/enable')
  enableSubscription(@Res() res: Response, @Param('id') id: number) {
    return this.subscribeService
      .enableSubscription(id)
      .then((result) => result.whenFail(this.handleAccessFail))
      .then((subscription) => res.json(subscription));
  }

  @Patch('/subscription/:id/disable')
  disableSubscription(@Res() res: Response, @Param('id') id: number) {
    return this.subscribeService
      .disableSubscription(id)
      .then((result) => result.whenFail(this.handleAccessFail))
      .then((subscription) => res.json(subscription));
  }

  /*
   * Handle failure
   */

  private handleCreateFail(f: SubscriptionService.CreateFail): never {
    if (f === SubscriptionService.CreateFail.UnsupportedProvider)
      throw new BadRequestError('Illegal error: target manga id');
    if (f === SubscriptionService.CreateFail.IlligalTargetMangaId)
      throw new BadRequestError('Illegal error: target manga id');
    if (f === SubscriptionService.CreateFail.MangaAlreadyExist)
      throw new ConflictError('Already exist: Target manga');
    if (f === SubscriptionService.CreateFail.TaskAlreadyExist)
      throw new ConflictError('Already exist: download task');
    throw new Error();
  }

  private handleAccessFail(f: SubscriptionService.AccessFail): never {
    if (f === SubscriptionService.AccessFail.SubscriptionNotFound)
      throw new NotFoundError('Not found: download subscription');
    throw new Error();
  }
}
