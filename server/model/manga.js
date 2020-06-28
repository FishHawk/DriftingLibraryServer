import { DataTypes } from 'sequelize';

import sequelize from './db.js';

const MangaStatus = Object.freeze({
  COMPLETED: 'completed',
  ONGOING: 'ongoing',
  UNKNOWN: 'unknown',

  parse(x) {
    if (x === this.COMPLETED || x === this.ONGOING || x === this.UNKNOWN) return x;
    else return null;
  },
});

const MangaModel = sequelize.define('manga', {
  id: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  thumb: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: MangaStatus.UNKNOWN,
  },
});

export default { Model: MangaModel, Status: MangaStatus };
