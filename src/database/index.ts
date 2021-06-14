import 'reflect-metadata';
import { Repository, createConnection } from 'typeorm';

import * as Entity from './entity';

export interface DatabaseAdapter {
  downloadDescRepository: Repository<Entity.DownloadDesc>;
}

export class DatabaseLoader {
  static createInstance(filepath: string) {
    return createConnection({
      type: 'sqlite',
      database: filepath,
      entities: [Entity.DownloadDesc],
      synchronize: true,
      logging: false,
    }).then((connection) => {
      return {
        downloadDescRepository: connection.getRepository(Entity.DownloadDesc),
      } as DatabaseAdapter;
    });
  }
}
