import { DataTypes } from 'sequelize';

import sequelize from './db.js';

const SubscriptionMode = Object.freeze({
  DISPOSABLE: 'disposable',
  ENABLED: 'enabled',
  DISABLED: 'disabled',

  parse(x) {
    if (x === this.DISPOSABLE || x === this.ENABLED || x === this.DISABLED) return x;
    else return null;
  },
});

const SubscriptionStatus = Object.freeze({
  WAITING: 'waiting',
  DOWNLOADING: 'downloading',
  COMPLETED: 'completed',
  PAUSED: 'paused',
  ERROR: 'error',

  parse(x) {
    if (
      x === this.WAITING ||
      x === this.DOWNLOADING ||
      x === this.COMPLETED ||
      x === this.PAUSED ||
      x === this.ERROR
    )
      return x;
    else return null;
  },
});

const SubscriptionModel = sequelize.define('subscription', {
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
  mode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: SubscriptionStatus.WAITING,
  },
});

export default { Model: SubscriptionModel, Mode: SubscriptionMode, Status: SubscriptionStatus };
