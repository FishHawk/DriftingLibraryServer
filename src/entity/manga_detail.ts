import { Status } from './manga_status';

export interface Chapter {
  readonly id: string;
  readonly name: string;
  readonly title: string;
}

export interface Collection {
  readonly id: string;
  readonly chapters: Chapter[];
}

export interface Tag {
  readonly key: string;
  readonly value: string[];
}

export interface Metadata {
  title?: string;
  authors?: string[];
  tags?: Tag[];
  description?: string;
}

export interface MangaDetail {
  source: string | undefined;
  id: string;
  title: string | undefined;
  thumb: string | undefined;

  authors: string[] | undefined;
  status: Status | undefined;
  updateTime: number | undefined;
  description: string | undefined;

  tags: Tag[];
  collections: Collection[];
}
