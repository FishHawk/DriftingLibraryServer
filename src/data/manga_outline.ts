import { MangaStatus } from './manga_status';
import { MangaSource } from './manga_source';

export interface MetadataOutline {
  title?: string;
  authors?: string[];
  status?: MangaStatus;
}

export interface MangaOutline {
  id: string;
  thumb?: string;
  updateTime?: number;
  hasNewMark?: boolean;
  source?: MangaSource;

  metadata: MetadataOutline;
}
