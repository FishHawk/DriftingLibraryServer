import { DataTypes, Optional, Sequelize, ModelDefined } from 'sequelize';

export interface DownloadChapterTaskAttributes {
  id: number;
  source: string;
  sourceChapter: string;
  targetManga: string;
  targetCollection: string;
  targetChapter: string;
  pageTotal: number;
  pageDownloaded: number;
  isCompleted: boolean;
}

export interface DownloadChapterTaskCreationAttributes
  extends Optional<DownloadChapterTaskAttributes, 'id'> {}

export type DownloadChapterTaskModel = ModelDefined<
  DownloadChapterTaskAttributes,
  DownloadChapterTaskCreationAttributes
>;

export function makeDownloadChapterTaskModel(sequelize: Sequelize): DownloadChapterTaskModel {
  return sequelize.define('DownloadChapterTask', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
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
}
