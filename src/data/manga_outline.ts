import { MangaStatus } from './manga_status';
import { MangaSource } from './manga_source';

export interface MetadataOutline {
  title?: string;
  authors?: string[];
  status?: MangaStatus;
}

export interface MangaOutline {
  id: string;
  cover?: string;
  updateTime?: number;
  hasNewMark?: boolean;

  metadata: MetadataOutline;
  source?: MangaSource;
}
