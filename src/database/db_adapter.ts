import 'reflect-metadata';
import path from 'path';
import { Repository, createConnection } from 'typeorm';

import * as Entity from './entity';

export interface DatabaseAdapter {
  downloadChapterRepository: Repository<Entity.DownloadChapter>;
  downloadTaskRepository: Repository<Entity.DownloadTask>;
  subscriptionRepository: Repository<Entity.Subscription>;
}

export async function createSqliteDatabase(libraryDir: string) {
  return createConnection({
    type: 'sqlite',
    database: path.join(libraryDir, '.db.sqlite'),
    entities: [Entity.DownloadChapter, Entity.DownloadTask, Entity.Subscription],
    synchronize: true,
    logging: false,
  }).then((connection) => {
    return {
      downloadChapterRepository: connection.getRepository(Entity.DownloadChapter),
      downloadTaskRepository: connection.getRepository(Entity.DownloadTask),
      subscriptionRepository: connection.getRepository(Entity.Subscription),
    } as DatabaseAdapter;
  });
}
