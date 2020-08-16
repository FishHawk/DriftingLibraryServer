import { Status } from './manga_status';
import { MangaDetail, Metadata, Collection, Tag } from './manga_detail';

export class MangaDetailBuilder implements MangaDetail {
  source: string | undefined;
  id: string;
  title: string;
  thumb: string | undefined;

  authors: string[] | undefined;
  status: Status | undefined;
  updateTime: number | undefined;
  description: string | undefined;

  tags: Tag[] = [];
  collections: Collection[] = [];

  constructor(id: string) {
    this.id = id;
    this.title = id;
  }

  setMetaData(metadata: Metadata): MangaDetailBuilder {
    if (metadata.title) this.title = metadata.title;
    if (metadata.authors) this.authors = metadata.authors;
    if (metadata.description) this.description = metadata.description;
    if (metadata.tags) this.tags = metadata.tags;
    return this;
  }

  setThumb(thumb: string | undefined): MangaDetailBuilder {
    this.thumb = thumb;
    return this;
  }

  setCollections(collections: Collection[]): MangaDetailBuilder {
    this.collections = collections;
    return this;
  }

  setUpdateTime(updateTime: number): MangaDetailBuilder {
    this.updateTime = updateTime;
    return this;
  }

  build(): MangaDetail {
    return this;
  }
}
