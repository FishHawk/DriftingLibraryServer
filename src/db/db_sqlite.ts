import { Sequelize } from 'sequelize';

import { DatabaseAdapter } from './db_adapter';

import {
  DownloadChapterTaskModel,
  makeDownloadChapterTaskModel,
} from './model/download_chapter_task.js';
import { DownloadTaskModel, makeDownloadTaskModel } from './model/download_task.js';
import { SubscriptionModel, makeSubscriptionModel } from './model/subscription.js';

export class DatabaseSqlite implements DatabaseAdapter {
  readonly downloadChapterTaskModel: DownloadChapterTaskModel;
  readonly downloadTaskModel: DownloadTaskModel;
  readonly subscriptionModel: SubscriptionModel;

  readonly sequelize: Sequelize;

  constructor(dbfile: string) {
    this.sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: dbfile,
      logging: false,
    });

    this.downloadChapterTaskModel = makeDownloadChapterTaskModel(this.sequelize);
    this.downloadTaskModel = makeDownloadTaskModel(this.sequelize);
    this.subscriptionModel = makeSubscriptionModel(this.sequelize);
  }

  init(): Promise<void> {
    return this.sequelize.authenticate().then(() => this.sequelize.sync()) as Promise<void>;
  }
}
