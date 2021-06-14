// @Controller('/subscription')
// export class SubscriptionController {
  // @Get('/list')
  // getAllSubscription(@Res() res: Response) {
  //   return this.subscribeService
  //     .getAllSubscription()
  //     .then((it) => res.json(it));
  // }

  // @Patch('/list/update')
  // updateAllSubscription(@Res() res: Response) {
  //   return this.subscribeService
  //     .updateAllSubscription()
  //     .then(this.subscribeService.getAllSubscription)
  //     .then((it) => res.json(it));
  // }

  // @Post('/item')
  // createSubscription(
  //   @Res() res: Response,
  //   @BodyField('providerId') providerId: string,
  //   @BodyField('sourceManga') sourceManga: string,
  //   @BodyField('targetManga') targetManga: string
  // ) {
  //   return this.subscribeService
  //     .createSubscription(providerId, sourceManga, targetManga)
  //     .then((result) => result.whenFail(this.handleCreateFail))
  //     .then((it) => res.json(it));
  // }

// }
//