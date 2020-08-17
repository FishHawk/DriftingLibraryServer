import { DownloadTaskModel } from './model/download_task';
import { SubscriptionModel } from './model/subscription';

export interface DatabaseAdapter {
  readonly downloadTaskModel: DownloadTaskModel;
  readonly subscriptionModel: SubscriptionModel;

  init(): Promise<void>;
}
