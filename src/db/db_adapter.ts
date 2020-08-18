import { DownloadChapterTask } from './model/download_chapter_task';
import { DownloadTask } from './model/download_task';
import { Subscription } from './model/subscription';

export interface DatabaseAdapter {
  readonly downloadChapterTaskModel: DownloadChapterTask.Model;
  readonly downloadTaskModel: DownloadTask.Model;
  readonly subscriptionModel: Subscription.Model;

  init(): Promise<void>;
}

export { DownloadChapterTask } from './model/download_chapter_task';
export { DownloadTask } from './model/download_task';
export { Subscription } from './model/subscription';
