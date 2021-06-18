import path from 'path';
import express from 'express';

import { logger } from '@logger';
import { SettingLoader } from '@settings';
import { LibraryAccessor } from '@library/accessor.library';
import { ProviderManager } from '@provider/manager';
import { LibraryService, ProviderService, Downloader } from '@service';
import {
  bind,
  LibraryController,
  ProviderController,
  SystemController,
  errorHandleMiddleware,
  logMiddleware,
} from '@controller';

export class App {
  private readonly app = express();

  private libraryAccessor!: LibraryAccessor;
  private providerManager!: ProviderManager;
  private downloader!: Downloader;

  private libraryService!: LibraryService;
  private providerService!: ProviderService;

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

    /* component */
    this.libraryAccessor = new LibraryAccessor(this.libraryDir);
    this.providerManager = new ProviderManager();
    this.downloader = new Downloader(
      this.libraryAccessor,
      this.providerManager
    );

    this.libraryService = new LibraryService(
      this.libraryAccessor,
      this.providerManager,
      this.downloader
    );
    this.providerService = new ProviderService(this.providerManager);

    /* controller */
    [
      new LibraryController(this.libraryService),
      new ProviderController(this.providerService),
      new SystemController(),
    ].forEach((controller) => {
      bind(this.app, controller);
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
