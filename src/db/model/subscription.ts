import { Sequelize, ModelDefined, DataTypes, Optional } from 'sequelize';

export namespace Subscription {
  export interface Attributes {
    id: number;
    source: string;
    sourceManga: string;
    targetManga: string;
    isEnabled: string;
  }

  export interface CreationAttributes extends Optional<Attributes, 'id'> {}

  export type Model = ModelDefined<Attributes, CreationAttributes>;

  export function createModel(sequelize: Sequelize): Model {
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
}
