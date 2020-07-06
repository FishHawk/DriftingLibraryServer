import path from 'path';
import { Sequelize } from 'sequelize';

import { libraryDir } from '../config.js';

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(libraryDir, '.db.sqlite'),
  logging: false,
});
