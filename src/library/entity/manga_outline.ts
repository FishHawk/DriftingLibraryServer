import { Status } from './manga_status';

export interface MetadataOutline {
  title?: string;
  authors?: string[];
  status?: Status;
}

export interface MangaOutline {
  id: string;
  thumb: string | undefined;
  updateTime: number | undefined;

  metadata: MetadataOutline;
}