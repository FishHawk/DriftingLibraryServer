import { DataTypes, Optional, Sequelize, ModelDefined } from 'sequelize';

export enum DownloadTaskStatus {
  Waiting = 'waiting',
  Downloading = 'downloading',
  Paused = 'paused',
  Error = 'error',
}

export interface DownloadTaskAttributes {
  id: number;
  source: string;
  sourceManga: string;
  targetManga: string;
  status: DownloadTaskStatus;
  isCreatedBySubscription: boolean;
}

export interface DownloadTaskCreationAttributes extends Optional<DownloadTaskAttributes, 'id'> {}

export type DownloadTaskModel = ModelDefined<
  DownloadTaskAttributes,
  DownloadTaskCreationAttributes
>;

export function makeDownloadTaskModel(sequelize: Sequelize): DownloadTaskModel {
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
      defaultValue: DownloadTaskStatus.Waiting,
    },
    isCreatedBySubscription: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  });
}
