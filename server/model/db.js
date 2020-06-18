import path from 'path';
import { Sequelize } from 'sequelize';

import config from '../config.js';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(config.libraryDir, '.library.sqlite'),
  logging: false,
});

export default sequelize;
