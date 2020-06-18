import { DataTypes } from 'sequelize';

import sequelize from './db.js';

const Order = sequelize.define('order', {
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
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default Order;
