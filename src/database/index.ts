import 'reflect-metadata';
import { Repository, createConnection } from 'typeorm';

import * as Entity from './entity';

export interface DatabaseAdapter {
  downloadDescRepository: Repository<Entity.DownloadDesc>;
  subscriptionRepository: Repository<Entity.Subscription>;
}

export class DatabaseLoader {
  static createInstance(filepath: string) {
    return createConnection({
      type: 'sqlite',
      database: filepath,
      entities: [Entity.DownloadDesc, Entity.Subscription],
      synchronize: true,
      logging: false,
    }).then((connection) => {
      return {
        downloadDescRepository: connection.getRepository(Entity.DownloadDesc),
        subscriptionRepository: connection.getRepository(Entity.Subscription),
      } as DatabaseAdapter;
    });
  }
}
