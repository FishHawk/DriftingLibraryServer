import express from 'express';
import bodyParser from 'body-parser';

import { port } from './config.js';
import { logger } from './logger.js';
import { sequelize } from './model/db.js';
import router from './routes/index.js';

import './provider/subscriber.js';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

sequelize
  .authenticate()
  .then(() => {
    logger.info('Init: Database connection has been established successfully.');
    return sequelize.sync();
  })
  .then(() => {
    app.use('/', router);
    app.listen(port, () => {
      logger.info(`Init: Listen on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    logger.error(error.stack);
  });
