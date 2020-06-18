import express from 'express';
import bodyParser from 'body-parser';

import router from './routes/index.js';
import sequelize from './model/db.js';
import { errorHandler } from './error.js';
import config from './config.js';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

sequelize.sync({ alter: true }).then(() => {
  console.log('test');
});

app.use('/', router);

app.use('/api', errorHandler);

const port = config.port;
app.listen(port, () => {
  console.log(`服务器启动：http://localhost:${port}`);
});
