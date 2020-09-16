import express, { Request, Response, NextFunction } from 'express';

import { ControllerAdapter } from './controller/adapter';
import { DownloadController } from './controller/controller.download';
import { LibraryController } from './controller/controller.library';
import { ProviderController } from './controller/controller.provider';
import { SubscriptionController } from './controller/controller.subscription';
import { HttpError } from './controller/exception';

import { createSqliteDatabase, DatabaseAdapter } from './database/adapter';
import { LibraryAccessor } from './library/accessor.library';
import { ProviderManager } from './provider/manager';
import { DownloadService } from './service/service.download';
import { SubscriptionService } from './service/service.subscription';

import { logger } from './util/logger';

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

  static async createApplication(port: number, libraryDir: string) {
    return new App(port, libraryDir).initialize();
  }

  private constructor(port: number, libraryDir: string) {
    this.app = express();
    this.port = port;
    this.libraryDir = libraryDir;
  }

  private async initialize() {
    // Middlewares
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(logMiddleware);
    this.app.get('/test', (req: Request, res: Response) => {
      res.send('Hello World!');
    });

    // Components
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

    // Controllers
    this.controllers = [
      new LibraryController(
        this.libraryAccessor,
        this.downloadService,
        this.subscribeService
      ),
      new ProviderController(this.providerManager),
      new DownloadController(this.downloadService),
      new SubscriptionController(this.subscribeService),
    ];
    this.controllers.forEach((controller) => {
      this.app.use('/', controller.router);
    });

    // Error handle
    this.app.use(errorHandlerMiddleware);
    return this;
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`Init: Listen on http://localhost:${this.port}`);
    });
  }
}

const logMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  logger.info(`Request: ${req.method} ${req.url}`);
  next();
};

const errorHandlerMiddleware = (
  err: HttpError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error(err.stack);
  const status = err.status || 500;
  const message = err.message || 'Unexceped error.';
  res.status(status).send(message);
};
