import { MangaStatus } from './manga_status';
import { MangaSource } from './manga_source';
import { Provider } from './provider';

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
  status?: MangaStatus;

  description?: string;
  tags?: Tag[];
}

export interface MangaDetail {
  provider?: Provider;
  id: string;
  cover?: string;
  updateTime?: number;

  metadata: MetadataDetail;
  source?: MangaSource;
  collections: Collection[];
  preview?: string[];
}
