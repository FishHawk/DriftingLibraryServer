import express from 'express';
import bodyParser from 'body-parser';

import { logger } from './logger';
import { createSqliteDatabase, DatabaseAdapter } from './db/db_adapter';
import { createLocalLibrary, LibraryAdapter } from './library/adapter';
import { ProviderService } from './service/service.provider';
import { ControllerAdapter } from './controller/adapter';
import { ControllerLibrary } from './controller/controller.library';
import { DownloadService } from './service/service.download';

export class App {
  private readonly app: express.Application;
  private readonly port: number;
  private readonly libraryDir: string;

  private db!: DatabaseAdapter;
  private library!: LibraryAdapter;

  private providerService!: ProviderService;
  private downloadService!: DownloadService;

  private controllers!: ControllerAdapter[];

  static async createApplication(port: number, libraryDir: string) {
    return new App(port, libraryDir).initialize();
  }

  private constructor(port: number, libraryDir: string) {
    this.app = express();
    this.port = port;
    this.libraryDir = libraryDir;
  }

  private async initialize() {
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));

    this.db = await createSqliteDatabase(this.libraryDir);
    this.library = createLocalLibrary(this.libraryDir);

    this.providerService = new ProviderService();
    this.downloadService = new DownloadService(this.db, this.library, this.providerService);

    this.controllers = [new ControllerLibrary(this.db, this.library)];
    this.controllers.forEach((controller) => {
      this.app.use('/', controller.router);
    });

    return this;
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`Init: Listen on http://localhost:${this.port}`);
    });
  }
}
