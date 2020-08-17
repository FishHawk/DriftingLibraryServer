import express from 'express';
import bodyParser from 'body-parser';

import { port } from './config';
import { logger } from './logger';
import { setupDb } from './db/db_setup';
// import router from './routes/index.js';

// import './provider/subscriber.js';

setupDb()
  .then(() => {
    const app = express();

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    //   app.use('/', router);
    app.listen(port, () => {
      logger.info(`Init: Listen on http://localhost:${port}`);
    });
  })
  .catch((error) => {
  });
