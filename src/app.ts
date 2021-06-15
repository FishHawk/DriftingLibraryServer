import path from 'path';
import express from 'express';

import { logger } from './logger';

import { DownloadController } from './controller/controller.download';
import { LibraryController } from './controller/controller.library';
import { ProviderController } from './controller/controller.provider';
import { SystemController } from './controller/controller.system';
import { bind } from './controller/decorator/bind';

import { logMiddleware } from './controller/middleware.log';
import { errorHandleMiddleware } from './controller/middleware.error_handle';

import settings, { SettingLoader } from './settings';
import { DatabaseLoader, DatabaseAdapter } from './database';
import { LibraryAccessor } from './library/accessor.library';
import { ProviderManager } from './provider/manager';
import { LibraryService } from './service/service.library';
import { ProviderService } from './service/service.provider';
import { DownloadService } from './service/service.download';

export class App {
  private readonly app = express();

  private database!: DatabaseAdapter;
  private libraryAccessor!: LibraryAccessor;
  private providerManager!: ProviderManager;

  private libraryService!: LibraryService;
  private providerService!: ProviderService;
  private downloadService!: DownloadService;

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

    this.providerService = new ProviderService(this.providerManager);
    this.downloadService = new DownloadService(
      this.database.downloadDescRepository,
      this.libraryAccessor,
      this.providerManager
    );
    this.libraryService = new LibraryService(
      this.libraryAccessor,
      this.database.downloadDescRepository,
      this.downloadService
    );

    /* controller */
    [
      new LibraryController(this.libraryService),
      new ProviderController(this.providerService),
      new DownloadController(this.downloadService),
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
