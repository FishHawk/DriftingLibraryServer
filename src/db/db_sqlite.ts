import { Sequelize } from 'sequelize';

import { DatabaseAdapter, DownloadChapterTask, DownloadTask, Subscription } from './db_adapter';

export class DatabaseSqlite implements DatabaseAdapter {
  readonly downloadChapterTaskModel: DownloadChapterTask.Model;
  readonly downloadTaskModel: DownloadTask.Model;
  readonly subscriptionModel: Subscription.Model;

  readonly sequelize: Sequelize;

  constructor(dbfile: string) {
    this.sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: dbfile,
      logging: false,
    });

    this.downloadChapterTaskModel = DownloadChapterTask.createModel(this.sequelize);
    this.downloadTaskModel = DownloadTask.createModel(this.sequelize);
    this.subscriptionModel = Subscription.createModel(this.sequelize);
  }

  init(): Promise<void> {
    return this.sequelize.authenticate().then(() => this.sequelize.sync()) as Promise<void>;
  }
}
