import { MangaStatus } from './manga_status';
import { MangaSource } from './manga_source';
import { ProviderInfo } from './provider_info';

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
  provider?: ProviderInfo;
  id: string;
  thumb?: string;
  updateTime?: number;

  metadata: MetadataDetail;
  source?: MangaSource;
  collections: Collection[];
  preview?: string[];
}
