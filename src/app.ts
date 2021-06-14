import path from 'path';
import express from 'express';

import { logger } from './logger';

import { DownloadController } from './controller/controller.download';
import { LibraryController } from './controller/controller.library';
import { ProviderController } from './controller/controller.provider';
import { SubscriptionController } from './controller/controller.subscription';
import { SystemController } from './controller/controller.system';
import { bind } from './controller/decorator/bind';

import { logMiddleware } from './controller/middleware.log';
import { errorHandleMiddleware } from './controller/middleware.error_handle';

import settings, { SettingLoader } from './settings';
import { DatabaseLoader, DatabaseAdapter } from './database';
import { LibraryAccessor } from './library/accessor.library';
import { ProviderManager } from './provider/manager';
import { DownloadService } from './service/service.download';
import { SubscriptionService } from './service/service.subscription';
import { LibraryService } from './service/service.library';

export class App {
  private readonly app = express();

  private database!: DatabaseAdapter;
  private libraryAccessor!: LibraryAccessor;
  private providerManager!: ProviderManager;
  private libraryService!: LibraryService;
  private downloadService!: DownloadService;
  private subscribeService!: SubscriptionService;

  public static async createInstance(libraryDir: string, port: number) {
    return new App(libraryDir, port).initialize();
  }

  private constructor(
    private readonly libraryDir: string,
    private readonly port: number
  ) {}

  private async initialize() {
    /* middleware */
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(logMiddleware);

    /* setting */
    const settingFilepath = path.join(this.libraryDir, 'settings.json');
    await SettingLoader.fromFile(settingFilepath);

    /* database */
    const databaseFilepath = path.join(this.libraryDir, '.db.sqlite');
    this.database = await DatabaseLoader.createInstance(databaseFilepath);

    /* component */
    this.libraryAccessor = new LibraryAccessor(this.libraryDir);
    this.providerManager = new ProviderManager();

    this.downloadService = new DownloadService(
      this.database.downloadDescRepository,
      this.libraryAccessor,
      this.providerManager
    );
    this.subscribeService = new SubscriptionService(
      this.database.subscriptionRepository,
      this.downloadService
    );
    this.libraryService = new LibraryService(
      this.libraryAccessor,
      this.downloadService,
      this.subscribeService
    );

    /* controller */
    [
      new LibraryController(this.libraryService),
      new ProviderController(this.providerManager),
      new DownloadController(this.downloadService),
      new SubscriptionController(this.subscribeService),
      new SystemController(),
    ].forEach((controller) => {
      bind(this.app, controller);
    });

    /* error handle middleware */
    this.app.use(errorHandleMiddleware);
    return this;
  }

  public listen() {
    this.app.listen(settings.port, () => {
      logger.info(`Listen on http://localhost:${settings.port}`);
    });
  }
}
