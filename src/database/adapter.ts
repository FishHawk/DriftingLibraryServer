import 'reflect-metadata';
import path from 'path';
import { Repository, createConnection } from 'typeorm';

import * as Entity from './entity';

export interface DatabaseAdapter {
  downloadChapterRepository: Repository<Entity.DownloadChapterDesc>;
  downloadTaskRepository: Repository<Entity.DownloadDesc>;
  subscriptionRepository: Repository<Entity.Subscription>;
}

export async function createSqliteDatabase(libraryDir: string) {
  return createConnection({
    type: 'sqlite',
    database: path.join(libraryDir, '.db.sqlite'),
    entities: [Entity.DownloadChapterDesc, Entity.DownloadDesc, Entity.Subscription],
    synchronize: true,
    logging: false,
  }).then((connection) => {
    return {
      downloadChapterRepository: connection.getRepository(Entity.DownloadChapterDesc),
      downloadTaskRepository: connection.getRepository(Entity.DownloadDesc),
      subscriptionRepository: connection.getRepository(Entity.Subscription),
    } as DatabaseAdapter;
  });
}
