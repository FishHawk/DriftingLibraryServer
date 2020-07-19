import { CronJob } from 'cron';

import { startDownloader } from '../provider/downloader.js';

import DownloadTask from '../model/download_task.js';
import Subscription from '../model/subscription.js';

new CronJob('0 0 4 * * *', updateAllSubscription, null, true, 'Asia/Chongqing');

async function updateAllSubscription() {
  const subscriptions = await Subscription.Model.findAll({ where: { isEnable: true } });
  for (const subscription of subscriptions) {
    await updateSubscription(subscription);
  }
  startDownloader();
}

async function updateSubscription(subscription) {
  console.log(`Update Subscription`);
  const downloadTask = await DownloadTask.Model.findOne({
    where: { targetManga: subscription.targetManga },
  });
  if (downloadTask === null) {
    await DownloadTask.Model.create({
      source: subscription.source,
      sourceManga: subscription.sourceManga,
      targetManga: subscription.targetManga,
      isCreatedBySubscription: true,
    });
  } else if (downloadTask.status !== DownloadTask.Status.DOWNLOADING) {
    await downloadTask.update({ status: DownloadTask.Status.WAITING });
  }
}
