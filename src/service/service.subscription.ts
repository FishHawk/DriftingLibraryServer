import { CronJob } from 'cron';

import { logger } from '../logger';
import { DatabaseAdapter } from '../database/adapter';
import { Subscription } from '../database/entity';
import { DownloadTaskStatus } from '../database/entity/download_task';
import { Result, fail, ok } from '../util/result';

import { DownloadService } from './service.download';

export class SubscriptionService {
  constructor(
    private readonly db: DatabaseAdapter,
    private readonly downloadService: DownloadService
  ) {
    new CronJob('0 0 4 * * *', this.updateAllSubscription, null, true, 'Asia/Chongqing');
  }

  private async updateAllSubscription() {
    logger.info('Update subscription');
    const subscriptions = await this.db.subscriptionRepository.find({
      where: { isEnable: true },
    });
    return Promise.all(subscriptions.map(this.updateSubscription));
  }

  private async updateSubscription(subscription: Subscription) {
    const downloadTask = await this.db.downloadTaskRepository.findOne({
      where: { id: subscription.id },
    });

    if (downloadTask === undefined) {
      const task = this.db.downloadTaskRepository.create({
        providerId: subscription.providerId,
        sourceManga: subscription.sourceManga,
        id: subscription.id,
        isCreatedBySubscription: true,
      });
      await this.db.downloadTaskRepository.save(task);
    } else if (downloadTask.status !== DownloadTaskStatus.Downloading) {
      downloadTask.status = DownloadTaskStatus.Waiting;
      await this.db.downloadTaskRepository.save(downloadTask);
    }
  }

  getAllSubscription() {
    return this.db.subscriptionRepository.find();
  }

  toggleAllSubscription(isEnabled: boolean) {
    return this.db.subscriptionRepository.update(
      { isEnabled: !isEnabled },
      { isEnabled }
    );
  }

  async createSubscription(
    providerId: string,
    sourceManga: string,
    targetManga: string
  ): Promise<Result<Subscription, CreateFail>> {
    const maybeFail = await this.downloadService.createDownloadTask(
      providerId,
      sourceManga,
      targetManga,
      true
    );
    if (maybeFail.isFail()) return fail(maybeFail.extract());

    const subscription = this.db.subscriptionRepository.create({
      providerId,
      sourceManga,
      id: targetManga,
    });
    await this.db.subscriptionRepository.save(subscription);
    return ok(subscription);
  }

  async deleteSubscription(id: string): Promise<Result<Subscription, AccessFail>> {
    const subscription = await this.db.subscriptionRepository.findOne(id);
    if (subscription === undefined) return fail(AccessFail.SubscriptionNotFound);

    await this.downloadService.deleteDownloadTask(subscription.id);
    await this.db.subscriptionRepository.remove(subscription);
    return ok(subscription);
  }

  async toggleSubscription(
    id: string,
    isEnabled: boolean
  ): Promise<Result<Subscription, AccessFail>> {
    const subscription = await this.db.subscriptionRepository.findOne(id);
    if (subscription === undefined) return fail(AccessFail.SubscriptionNotFound);

    subscription.isEnabled = isEnabled;
    await this.db.subscriptionRepository.save(subscription);
    return ok(subscription);
  }
}

/* fail */
export namespace SubscriptionService {
  export enum AccessFail {
    SubscriptionNotFound,
  }

  export import CreateFail = DownloadService.CreateFail;
}
import CreateFail = SubscriptionService.CreateFail;
import AccessFail = SubscriptionService.AccessFail;
