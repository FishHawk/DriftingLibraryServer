import 'reflect-metadata';
import { Repository, createConnection } from 'typeorm';

import { DownloadChapterTask } from './entity/download_chapter_task';
import { DownloadTask } from './entity/download_task';
import { Subscription } from './entity/subscription';

export interface DatabaseAdapter {
  downloadChapterTaskRepository: Repository<DownloadChapterTask>;
  downloadTaskRepository: Repository<DownloadTask>;
  subscriptionRepository: Repository<Subscription>;
}

export async function createSqliteDatabase(path: string) {
  return createConnection({
    type: 'sqlite',
    database: path,
    entities: [DownloadChapterTask, DownloadTask, Subscription],
    synchronize: true,
    logging: false,
  }).then((connection) => {
    return {
      downloadChapterTaskRepository: connection.getRepository(DownloadChapterTask),
      downloadTaskRepository: connection.getRepository(DownloadTask),
      subscriptionRepository: connection.getRepository(Subscription),
    } as DatabaseAdapter;
  });
}
