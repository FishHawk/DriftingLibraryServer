import { port, libraryDir } from './config';
import { logger } from './logger';
import { App } from './app';

App.createApplication(port, libraryDir)
  .then((app) => {
    app.listen();
  })
  .catch((e) => {
    logger.error(e);
  });
