import path from 'path';
import sqlite3 from 'sqlite3';

import config from './config.js';

const db = new sqlite3.Database(
  path.join(config.libraryDir, '.server.db'),
  sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      console.log('Could not connect to database', err);
    } else {
      console.log('Connected to database');

      // db.run(`CREATE TABLE IF NOT EXISTS manga_order (
      //   id INTEGER PRIMARY KEY AUTOINCREMENT,
      //   manga_id STRING,
      //   provider STRING,
      //   provider_manga_id STRING
      //   );`);
    }
  }
);

export default db;
