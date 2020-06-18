import express from 'express';
import bodyParser from 'body-parser';

import config from './config.js';
import { errorHandler } from './error.js';
import sequelize from './model/db.js';
import router from './routes/index.js';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
    sequelize.sync();
  })
  .catch(() => {
    console.error('Unable to connect to the database:', error);
  });

app.use('/', router);

app.use('/api', errorHandler);

const port = config.port;
app.listen(port, () => {
  console.log(`服务器启动：http://localhost:${port}`);
});
