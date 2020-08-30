import 'reflect-metadata';
import path from 'path';
import { Repository, createConnection } from 'typeorm';

import { DownloadChapter } from './entity/download_chapter';
import { DownloadTask } from './entity/download_task';
import { Subscription } from './entity/subscription';

export interface DatabaseAdapter {
  downloadChapterRepository: Repository<DownloadChapter>;
  downloadTaskRepository: Repository<DownloadTask>;
  subscriptionRepository: Repository<Subscription>;
}

export async function createSqliteDatabase(libraryDir: string) {
  return createConnection({
    type: 'sqlite',
    database: path.join(libraryDir, '.db.sqlite'),
    entities: [DownloadChapter, DownloadTask, Subscription],
    synchronize: true,
    logging: false,
  }).then((connection) => {
    return {
      downloadChapterRepository: connection.getRepository(DownloadChapter),
      downloadTaskRepository: connection.getRepository(DownloadTask),
      subscriptionRepository: connection.getRepository(Subscription),
    } as DatabaseAdapter;
  });
}
