import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';

import { port, libraryDir } from './config';
import { logger } from './logger';
import { createSqliteDatabase } from './db/db_adapter';
// import router from './routes/index.js';

// import './provider/subscriber.js';

async function setup() {
  const dbpath = path.join(libraryDir, '.db.sqlite');

  const db = await createSqliteDatabase('asdf');

  const app = express();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  //   app.use('/', router);
  app.listen(port, () => {
    logger.info(`Init: Listen on http://localhost:${port}`);
  });
}

setup();
