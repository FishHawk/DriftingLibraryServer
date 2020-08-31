import express from 'express';
import bodyParser from 'body-parser';

import { logger } from './logger';

import { ControllerAdapter } from './controller/adapter';
import { ControllerDownload } from './controller/controller.download';
import { ControllerLibrary } from './controller/controller.library';
import { ControllerProvider } from './controller/controller.provider';
import { ControllerSubscription } from './controller/controller.subscription';

import { createSqliteDatabase, DatabaseAdapter } from './db/db_adapter';
import { AccessorLibrary } from './library/accessor.library';
import { ProviderManager } from './provider/manager';
import { DownloadService } from './download/service.download';
import { SubscriptionService } from './download/service.subscription';

export class App {
  private readonly app: express.Application;
  private readonly port: number;
  private readonly libraryDir: string;

  private db!: DatabaseAdapter;
  private libraryAccessor!: AccessorLibrary;
  private providerManager!: ProviderManager;
  private downloadService!: DownloadService;
  private subscribeService!: SubscriptionService;

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
    this.app.use(function (req, res, next) {
      logger.info(`Request: ${req.method} ${req.url}`);
      next();
    });

    this.db = await createSqliteDatabase(this.libraryDir);
    this.libraryAccessor = new AccessorLibrary(this.libraryDir);
    this.providerManager = new ProviderManager();

    this.downloadService = new DownloadService(this.db, this.libraryAccessor, this.providerManager);
    this.subscribeService = new SubscriptionService(this.db, this.downloadService);

    this.controllers = [
      new ControllerLibrary(this.libraryAccessor, this.downloadService, this.subscribeService),
      new ControllerProvider(this.providerManager),
      new ControllerDownload(this.providerManager, this.downloadService),
      new ControllerSubscription(this.providerManager, this.subscribeService),
    ];
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
