import { Sequelize, ModelDefined, DataTypes, Optional } from 'sequelize';

export interface SubscriptionAttributes {
  id: number;
  source: string;
  sourceManga: string;
  targetManga: string;
  isEnabled: string;
}

export interface SubscriptionCreationAttributes extends Optional<SubscriptionAttributes, 'id'> {}

export type SubscriptionModel = ModelDefined<
  SubscriptionAttributes,
  SubscriptionCreationAttributes
>;

export function makeSubscriptionModel(sequelize: Sequelize): SubscriptionModel {
  return sequelize.define('Subscription', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
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
}
