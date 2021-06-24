import logger from '@logger';
import { App } from '@app';

App.createInstance()
  .then((app) => app.listen())
  .catch((e) => {
    logger.error(e.stack);
    process.exit(1);
  });
