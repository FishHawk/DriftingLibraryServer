import path from 'path';
import sqlite3 from 'sqlite3';

import config from './config.js';

const db = new sqlite3.Database(
  path.join(config.libraryDir, '.server.db'),
  sqlite3.OPEN_CREATE,
  (err) => {
    if (err) console.log('Could not connect to database', err);
    else console.log('Connected to database');
  }
);

export default db;
