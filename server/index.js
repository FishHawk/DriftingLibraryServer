import express from 'express';
import bodyParser from 'body-parser';

import { port } from './config.js';
import { errorHandler } from './error.js';
import { sequelize } from './model/db.js';
import router from './routes/index.js';

import './provider/subscriber.js';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

sequelize
  .authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
    return sequelize.sync();
  })
  .then(() => {
    app.use('/', router);
    app.use('/api', errorHandler);
    app.listen(port, () => {
      console.log(`Server：http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Error:', error);
  });
