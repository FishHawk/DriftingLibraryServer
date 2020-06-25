import { DataTypes } from 'sequelize';

import sequelize from './db.js';

const DownloadTaskStatus = Object.freeze({
  WAITING: 0,
  PROCESSING: 1,
  COMPLETED: 2,
  PAUSED: 3,
  ERROR: 4,
});

const DownloadTaskMode = Object.freeze({
  FORCE: 0,
  PASS_IF_MANGA_EXIST: 1,
  PASS_IF_COLLECTION_EXIST: 2,
  PASS_IF_CHAPTER_EXIST: 3,
  PASS_IF_IMAGE_EXIST: 4,

  isLegal(x) {
    if (!Number.isInteger(x)) return false;
    if (x < 0 || x > 4) return false;
    return true;
  },
});

const DownloadTask = sequelize.define('download_task', {
  source: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sourceMangaId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  targetMangaId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mode: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: DownloadTaskStatus.WAITING,
  },
  errorMessage: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '',
  },
});

export { DownloadTask, DownloadTaskMode, DownloadTaskStatus };
