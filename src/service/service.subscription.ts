import { CronJob } from 'cron';
import { Repository } from 'typeorm';

import { logger } from '../logger';
import { Subscription } from '../database/entity';
import { DownloadService } from './service.download';
import { Result, fail, ok } from '../util/result';

export class SubscriptionService {
  constructor(
    private readonly repository: Repository<Subscription>,
    private readonly downloadService: DownloadService
  ) {
    new CronJob('0 0 4 * * *', this.updateAllSubscription, null, true, 'Asia/Chongqing');
  }

  private async updateAllSubscription() {
    logger.info('Update subscription');
    const subscriptions = await this.repository.find({
      where: { isEnable: true },
    });
    return Promise.all(subscriptions.map(this.updateSubscription));
  }

  private async updateSubscription(subscription: Subscription) {
    const result = await this.downloadService.startDownloadTask(subscription.id);
    if (result === undefined) {
      await this.downloadService.createDownloadTask(
        subscription.providerId,
        subscription.sourceManga,
        subscription.id,
        true
      );
    }
  }

  /* list api */
  async getAllSubscription() {
    return this.repository.find();
  }

  async toggleAllSubscription(isEnabled: boolean) {
    return this.repository.update({ isEnabled: !isEnabled }, { isEnabled });
  }

  /* item api */
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

    const subscription = this.repository.create({
      providerId,
      sourceManga,
      id: targetManga,
    });
    await this.repository.save(subscription);
    return ok(subscription);
  }

  async deleteSubscription(id: string) {
    const subscription = await this.repository.findOne(id);
    if (subscription !== undefined) {
      await this.downloadService.deleteDownloadTask(subscription.id);
      await this.repository.remove(subscription);
    }
    return subscription;
  }

  async toggleSubscription(id: string, isEnabled: boolean) {
    const subscription = await this.repository.findOne(id);
    if (subscription !== undefined) {
      subscription.isEnabled = isEnabled;
      await this.repository.save(subscription);
    }
    return subscription;
  }
}

/* fail */
export namespace SubscriptionService {
  export import CreateFail = DownloadService.CreateFail;
}
import CreateFail = SubscriptionService.CreateFail;
