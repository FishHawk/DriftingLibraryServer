import { CronJob } from 'cron';

import { logger } from '../logger';
import { DatabaseAdapter, Entity } from '../db/db_adapter';
import { DownloadTaskStatus } from '../db/entity/download_task';

import { DownloadService } from './service.download';

export class SubscribeService {
  constructor(
    private readonly db: DatabaseAdapter,
    private readonly downloadService: DownloadService
  ) {
    new CronJob('0 0 4 * * *', this.updateAllSubscription, null, true, 'Asia/Chongqing');
  }

  async updateAllSubscription() {
    const subscriptions = await this.db.subscriptionRepository.find({ where: { isEnable: true } });
    for (const subscription of subscriptions) {
      await this.updateSubscription(subscription);
    }
    this.downloadService.start();
  }

  async updateSubscription(subscription: Entity.Subscription) {
    logger.info('Update subscription');
    const downloadTask = await this.db.downloadTaskRepository.findOne({
      where: { targetManga: subscription.targetManga },
    });

    if (downloadTask === undefined) {
      await this.db.downloadTaskRepository.create({
        providerId: subscription.providerId,
        sourceManga: subscription.sourceManga,
        targetManga: subscription.targetManga,
        isCreatedBySubscription: true,
      });
    } else if (downloadTask.status !== DownloadTaskStatus.Downloading) {
      downloadTask.status = DownloadTaskStatus.Waiting;
      await this.db.downloadTaskRepository.save(downloadTask);
    }
  }

  async getAllSubscription() {
    return this.db.subscriptionRepository.find();
  }

  async enableAllSubscription() {
    await this.db.subscriptionRepository.update({ isEnabled: true }, { isEnabled: false });
  }

  async disableAllSubscription() {
    await this.db.subscriptionRepository.update({ isEnabled: false }, { isEnabled: true });
  }

  async createSubscription(providerId: string, sourceManga: string, targetManga: string) {
    const task = await this.downloadService.createDownloadTask(
      providerId,
      sourceManga,
      targetManga,
      true
    );
    if (task === undefined) return undefined;
    const subscription = await this.db.subscriptionRepository.create({
      providerId,
      sourceManga,
      targetManga,
    });
    return subscription;
  }

  async deleteSubscription(id: number) {
    const subscription = await this.db.subscriptionRepository.findOne(id);
    if (subscription !== undefined) {
      const task = await this.db.downloadTaskRepository.findOne({
        targetManga: subscription.targetManga,
      });
      if (task !== undefined) await this.downloadService.deleteDownloadTask(task.id);
      await this.db.subscriptionRepository.remove(subscription);
    }
    return subscription;
  }

  async enableSubscription(id: number) {
    const subscription = await this.db.subscriptionRepository.findOne(id);
    if (subscription !== undefined) {
      subscription.isEnabled = true;
      await this.db.subscriptionRepository.save(subscription);
    }
    return subscription;
  }

  async disableSubscription(id: number) {
    const subscription = await this.db.subscriptionRepository.findOne(id);
    if (subscription !== undefined) {
      subscription.isEnabled = false;
      await this.db.subscriptionRepository.save(subscription);
    }
    return subscription;
  }
}
