import 'reflect-metadata';
import path from 'path';
import { Repository, createConnection } from 'typeorm';

import { DownloadChapterTask } from './entity/download_chapter_task';
import { DownloadTask } from './entity/download_task';
import { Subscription } from './entity/subscription';

export interface DatabaseAdapter {
  downloadChapterTaskRepository: Repository<DownloadChapterTask>;
  downloadTaskRepository: Repository<DownloadTask>;
  subscriptionRepository: Repository<Subscription>;
}

export async function createSqliteDatabase(libraryDir: string) {
  return createConnection({
    type: 'sqlite',
    database: path.join(libraryDir, '.db.sqlite'),
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
