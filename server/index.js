import express from 'express';
import bodyParser from 'body-parser';

import config from './config.js';
import error from './error.js';
import sequelize from './model/db.js';
import router from './routes/index.js';

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
    app.use('/api', error.errorHandler);
    app.listen(config.port, () => {
      console.log(`Server：http://localhost:${config.port}`);
    });
  })
  .catch((error) => {
    console.error('Error:', error);
  });
