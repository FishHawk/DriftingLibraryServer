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

export class App {
  private readonly app = express();

  private database!: DatabaseAdapter;
  private libraryAccessor!: LibraryAccessor;
  private providerManager!: ProviderManager;
  private downloadService!: DownloadService;
  private subscribeService!: SubscriptionService;

  public static async createInstance(rootDir: string) {
    return new App(rootDir).initialize();
  }

  private constructor(private readonly rootDir: string) {}

  private async initialize() {
    /* middleware */
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(logMiddleware);

    /* setting */
    const settingFilepath = path.join(this.rootDir, 'settings.json');
    await SettingLoader.fromFile(settingFilepath);

    /* database */
    const databaseFilepath = path.join(this.rootDir, '.db.sqlite');
    this.database = await DatabaseLoader.createInstance(databaseFilepath);

    /* component */
    this.libraryAccessor = new LibraryAccessor(this.rootDir);
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

    /* controller */
    [
      new LibraryController(
        this.libraryAccessor,
        this.downloadService,
        this.subscribeService
      ),
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
