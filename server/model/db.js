import path from 'path';
import Sequelize from 'sequelize';

import config from './config.js';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(config.libraryDir, '.library.sqlite'),
});

try {
  await sequelize.authenticate();
  console.log('Connection has been established successfully.');
} catch (error) {
  console.error('Unable to connect to the database:', error);
}

export default sequelize;
