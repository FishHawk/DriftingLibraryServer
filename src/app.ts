import express from 'express';

import config from '@config';
import logger from '@logger';
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
} from '@api';

export class App {
  private readonly libraryDir = config.app.libraryDir;
  private readonly port = config.app.port;

  private readonly app = express();

  private libraryAccessor!: LibraryAccessor;
  private providerManager!: ProviderManager;
  private downloader!: Downloader;

  private libraryService!: LibraryService;
  private providerService!: ProviderService;

  static async createInstance() {
    return new App().initialize();
  }

  private async initialize() {
    /* middleware */
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(logMiddleware);

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

    /* middleware */
    this.app.use(errorHandleMiddleware);
    return this;
  }

  listen() {
    this.app.listen(this.port, () => {
      logger.info(`Listen on http://localhost:${this.port}`);
    });
  }
}
