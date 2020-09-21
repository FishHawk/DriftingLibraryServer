import express from 'express';

import { logger } from './logger';

import { ControllerAdapter } from './controller/adapter';
import { DownloadController } from './controller/controller.download';
import { LibraryController } from './controller/controller.library';
import { ProviderController } from './controller/controller.provider';
import { SubscriptionController } from './controller/controller.subscription';
import { SystemController } from './controller/controller.system';

import { logMiddleware } from './controller/middleware.log';
import { errorHandleMiddleware } from './controller/middleware.error_handle';

import { createSqliteDatabase, DatabaseAdapter } from './database/adapter';
import { LibraryAccessor } from './library/accessor.library';
import { ProviderManager } from './provider/manager';
import { DownloadService } from './service/service.download';
import { SubscriptionService } from './service/service.subscription';

export class App {
  private readonly app: express.Application;
  private readonly port: number;
  private readonly libraryDir: string;

  private database!: DatabaseAdapter;
  private libraryAccessor!: LibraryAccessor;
  private providerManager!: ProviderManager;
  private downloadService!: DownloadService;
  private subscribeService!: SubscriptionService;

  private controllers!: ControllerAdapter[];

  public static async createApplication(port: number, libraryDir: string) {
    return new App(port, libraryDir).initialize();
  }

  private constructor(port: number, libraryDir: string) {
    this.app = express();
    this.port = port;
    this.libraryDir = libraryDir;
  }

  private async initialize() {
    /* middleware */
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(logMiddleware);

    /* component */
    this.database = await createSqliteDatabase(this.libraryDir);
    this.libraryAccessor = new LibraryAccessor(this.libraryDir);
    this.providerManager = new ProviderManager();

    this.downloadService = new DownloadService(
      this.database,
      this.libraryAccessor,
      this.providerManager
    );
    this.subscribeService = new SubscriptionService(
      this.database.subscriptionRepository,
      this.downloadService
    );

    /* controller */
    this.controllers = [
      new LibraryController(this.libraryAccessor, this.downloadService, this.subscribeService),
      new ProviderController(this.providerManager),
      new DownloadController(this.downloadService),
      new SubscriptionController(this.subscribeService),
      new SystemController(),
    ];
    this.controllers.forEach((controller) => {
      this.app.use('/', controller.router);
    });

    /* error handle middleware */
    this.app.use(errorHandleMiddleware);
    return this;
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`Listen on http://localhost:${this.port}`);
    });
  }
}
