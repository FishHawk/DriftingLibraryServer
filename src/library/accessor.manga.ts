import fs from 'fs/promises';
import path from 'path';

import * as fsu from '../util/fs';
import { validateFilename } from '../util/validate';

import * as Entity from './entity';
import { AccessorChapter } from './accessor.chapter';

export class AccessorManga {
  private readonly dir: string;

  constructor(libraryDir: string, private readonly id: string) {
    this.dir = path.join(libraryDir, id);
  }

  async getMangaOutline(): Promise<Entity.MangaOutline> {
    const mangaOutline: Entity.MangaOutline = {
      id: this.id,
      thumb: await this.getThumb(),
      updateTime: await this.getUpdateTime(),
      metadata: await this.getMetadataOutline(),
    };
    return mangaOutline;
  }

  async getMangaDetail(): Promise<Entity.MangaDetail> {
    const mangaDetail: Entity.MangaDetail = {
      id: this.id,
      thumb: await this.getThumb(),
      updateTime: await this.getUpdateTime(),
      metadata: await this.getMetadataDetail(),
      collections: await this.getCollections(),
    };
    return mangaDetail;
  }

  async setMangaDetail(detail: Entity.MangaDetail, thumb: Buffer | undefined): Promise<void> {
    await this.setMetadata(detail.metadata);
    if (thumb !== undefined) await this.setThumb(thumb);
    await this.setCollections(detail.collections);
  }

  async openChapter(collectionId: string, chapterId: string) {
    // TODO: better check
    if (collectionId.length !== 0 && !validateFilename(collectionId)) return undefined;
    if (chapterId.length !== 0 && !validateFilename(chapterId)) return undefined;

    const chapterDir = path.join(this.dir, collectionId, chapterId);
    if (!(await fsu.isDirectoryExist(chapterDir))) return undefined;
    return new AccessorChapter(chapterDir);
  }

  private async getThumb() {
    const possibleThumbFileName = ['thumb.jpg', 'thumb.png', 'thumb.png'];
    for (const filename of possibleThumbFileName) {
      const filepath = path.join(this.dir, filename);
      if (await fsu.isFileExist(filepath)) return filename;
    }
    // TODO: choose first image if thumb not exist
    return undefined;
  }

  async setThumb(thumb: Buffer) {
    // TODO: exam image type
    const thumbPath = path.join(this.dir, 'thumb.jpg');
    return await fs.writeFile(thumbPath, thumb);
  }

  private async getUpdateTime(): Promise<number> {
    return fs.stat(this.dir).then((stat) => stat.mtime.getTime());
  }

  private async refreshUpdateTime(): Promise<void> {
    return fs.stat(this.dir).then((stat) => fs.utimes(this.dir, stat.atime, Date.now()));
  }

  private async getMetadataOutline(): Promise<Entity.MetadataOutline> {
    const filepath = path.join(this.dir, 'metadata.json');
    return fsu.readJSON(filepath).then((json) => {
      // TODO: check json schema
      if (json === undefined) return {};
      return json;
    });
  }

  private async getMetadataDetail(): Promise<Entity.MetadataDetail> {
    const filepath = path.join(this.dir, 'metadata.json');
    return fsu.readJSON(filepath).then((json) => {
      // TODO: check json schema
      if (json === undefined) return {};
      return json;
    });
  }

  async setMetadata(metadata: Entity.MetadataDetail) {
    const matedataPath = path.join(this.dir, 'metadata.json');
    return fs.writeFile(matedataPath, JSON.stringify(metadata));
  }

  private async getCollections(): Promise<Entity.Collection[]> {
    const parseChapterId = (id: string): Entity.Chapter => {
      const sep = ' ';
      const sepPosition = id.indexOf(sep);
      const chapter: Entity.Chapter = {
        id: id,
        name: sepPosition < 0 ? id : id.substr(0, sepPosition),
        title: sepPosition < 0 ? '' : id.substr(sepPosition + 1),
      };
      return chapter;
    };

    const subFolders = await fsu.listDirectoryWithNaturalOrder(this.dir);
    if (subFolders.length != 0) {
      let collections = [];

      // depth 3
      for (const collectionId of subFolders) {
        const chapters = await fsu
          .listDirectoryWithNaturalOrder(path.join(this.dir, collectionId))
          .then((list) => list.map(parseChapterId));
        if (chapters.length > 0) {
          const collection: Entity.Collection = { id: collectionId, chapters: chapters };
          collections.push(collection);
        }
      }

      // depth 2
      if (collections.length === 0) {
        const chapters = subFolders.map((x) => parseChapterId(x));
        const collection: Entity.Collection = { id: '', chapters: chapters };
        collections.push(collection);
      }

      return collections;
    } else {
      // depth 1
      // TODO: add preview
      const chapter: Entity.Chapter = { id: '', name: '', title: '' };
      const collection: Entity.Collection = { id: '', chapters: [chapter] };
      return [collection];
    }
  }

  private async setCollections(collections: Entity.Collection[]): Promise<void> {
    //TODO: better check
    for (const collection of collections) {
      const collectionDir = path.join(this.dir, collection.id);
      if (!(await fsu.isDirectoryExist(collectionDir))) await fs.mkdir(collectionDir);

      for (const chapter of collection.chapters) {
        const chapterId = `${chapter.name} ${chapter.title}`;
        const chapterDir = path.join(collectionDir, chapterId);
        if (!(await fsu.isDirectoryExist(chapterDir))) await fs.mkdir(chapterDir);
      }
    }
  }
}
