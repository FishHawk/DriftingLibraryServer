import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';

import { port, libraryDir } from './config';
import { logger } from './logger';
import { DatabaseSqlite } from './db/db_sqlite';
// import router from './routes/index.js';

// import './provider/subscriber.js';

const dbpath = path.join(libraryDir, '.db.sqlite');
const db = new DatabaseSqlite(dbpath);

db.init()
  .then(() => {
    const app = express();

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    //   app.use('/', router);
    app.listen(port, () => {
      logger.info(`Init: Listen on http://localhost:${port}`);
    });
  })
  .catch((error) => {});
