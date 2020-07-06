import { DataTypes } from 'sequelize';
import { sequelize } from './db.js';

const SubscriptionModel = sequelize.define('Subscription', {
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
    unique: true,
  },
  isEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
});

export default { Model: SubscriptionModel };
