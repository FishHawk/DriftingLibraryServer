import { DataTypes } from 'sequelize';

import sequelize from './db.js';

const DownloadChapterTaskModel = sequelize.define('DownloadChapterTask', {
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
  isCompleted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

export default { Model: DownloadChapterTaskModel };
