import { Status } from "./manga_status";

export interface Chapter {
  readonly id: string;
  readonly name: string;
  readonly title: string;
}

export interface Collection {
  readonly id: string;
  readonly depth: number;
  readonly chapters: Chapter[];
}

export interface Tag {
  readonly key: string;
  readonly value: string[];
}

export interface Metadata {
  title?: string;
  author?: string;
  tags?: Tag[];
  description?: string;
}

export class MangaDetail {
  id: string;
  title: string | undefined;
  thumb: string | undefined;

  author: string | undefined;
  status: Status | undefined;
  updateTime: number | undefined;
  description: string | undefined;

  tags: Tag[] = [];
  collections: Collection[] = [];

  constructor(id: string) {
    this.id = id;
    this.title = id;
  }

  setMetaData(metadata: Metadata): MangaDetail {
    if (metadata.title) this.title = metadata.title;
    if (metadata.author) this.author = metadata.author;
    if (metadata.description) this.description = metadata.description;
    if (metadata.tags) this.tags = metadata.tags;
    return this;
  }

  setThumb(thumb: string | undefined): MangaDetail {
    this.thumb = thumb;
    return this;
  }

  setCollections(collections: Collection[]): MangaDetail {
    this.collections = collections;
    return this;
  }

  setUpdateTime(updateTime: number): MangaDetail {
    this.updateTime = updateTime;
    return this;
  }
}
