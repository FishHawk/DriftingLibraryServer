import { DataTypes, Optional, Sequelize, ModelDefined } from 'sequelize';

export namespace DownloadTask {
  export enum Status {
    Waiting = 'waiting',
    Downloading = 'downloading',
    Paused = 'paused',
    Error = 'error',
  }

  export interface Attributes {
    id: number;
    source: string;
    sourceManga: string;
    targetManga: string;
    status: Status;
    isCreatedBySubscription: boolean;
  }

  export interface CreationAttributes extends Optional<Attributes, 'id'> {}

  export type Model = ModelDefined<Attributes, CreationAttributes>;

  export function createModel(sequelize: Sequelize): Model {
    return sequelize.define('DownloadTask', {
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
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: Status.Waiting,
      },
      isCreatedBySubscription: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
    });
  }
}
