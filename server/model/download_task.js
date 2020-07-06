import { DataTypes } from 'sequelize';
import { sequelize } from './db.js';

const DownloadTaskStatus = Object.freeze({
  WAITING: 'waiting',
  DOWNLOADING: 'downloading',
  PAUSED: 'paused',
  ERROR: 'error',

  parse(x) {
    if (x === this.WAITING || x === this.DOWNLOADING || x === this.PAUSED || x === this.ERROR)
      return x;
    else return null;
  },
});

const DownloadTaskModel = sequelize.define('DownloadTask', {
  source: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sourceManga: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  targetManga: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: DownloadTaskStatus.WAITING,
  },
  isCreatedBySubscription: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
});

export default { Model: DownloadTaskModel, Status: DownloadTaskStatus };
