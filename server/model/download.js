import { DataTypes } from 'sequelize';

import sequelize from './db.js';

const DownloadModel = sequelize.define('download_task', {
  source: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sourceChapter: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  targetManga: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  targetCollection: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  targetChapter: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isCompleted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  pageTotal: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  pageDownloaded: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  errorMessage: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

export default { Model: DownloadModel };
