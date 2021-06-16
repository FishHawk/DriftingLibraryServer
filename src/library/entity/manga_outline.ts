import { Status } from './manga_status';
import { Source } from './source';

export interface MetadataOutline {
  title?: string;
  authors?: string[];
  status?: Status;
}

export interface MangaOutline {
  id: string;
  thumb?: string;
  updateTime?: number;
  hasNewMark?: boolean;
  source?: Source;

  metadata: MetadataOutline;
}
