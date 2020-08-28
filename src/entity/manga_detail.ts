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

export interface MetadataDetail {
  title?: string;
  authors?: string[];
  status?: Status;

  description?: string;
  tags?: Tag[];
}

export interface MangaDetail {
  source?: string;
  id: string;
  thumb?: string;
  updateTime?: number;

  metadata: MetadataDetail;
  collections: Collection[];
}
