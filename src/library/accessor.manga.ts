import fs from 'fs/promises';
import path from 'path';

import * as fsu from '../util/fs';
import { validateFilename } from '../util/validate';

import { MetadataOutline, MangaOutline } from './entity/manga_outline';
import { MetadataDetail, MangaDetail, Collection, Chapter } from './entity/manga_detail';
import { AccessorChapter } from './accessor.chapter';

export class AccessorManga {
  private readonly dir: string;

  constructor(libraryDir: string, private readonly id: string) {
    this.dir = path.join(libraryDir, id);
  }

  async parseMangaOutline(): Promise<MangaOutline> {
    const mangaOutline: MangaOutline = {
      id: this.id,
      thumb: await this.parseMangaThumb(),
      updateTime: await this.parseMangaUpdateTime(),
      metadata: await this.parseMangaMetadataOutline(),
    };
    return mangaOutline;
  }

  async parseMangaDetail(): Promise<MangaDetail> {
    const mangaDetail: MangaDetail = {
      id: this.id,
      thumb: await this.parseMangaThumb(),
      updateTime: await this.parseMangaUpdateTime(),
      metadata: await this.parseMangaMetadataDetail(),
      collections: await this.parseMangaCollections(),
    };
    return mangaDetail;
  }

  async updateMangaDetail(detail: MangaDetail, thumb: Buffer | undefined): Promise<void> {
    //TODO: better check
    const matedataPath = path.join(this.dir, 'metadata.json');
    await fs.writeFile(matedataPath, JSON.stringify(detail.metadata));

    if (thumb !== undefined) {
      const thumbPath = path.join(this.dir, 'thumb.jpg');
      return fs.writeFile(thumbPath, thumb);
    }

    for (const collection of detail.collections) {
      const collectionDir = path.join(this.dir, collection.id);
      if (!(await fsu.isDirectoryExist(collectionDir))) await fs.mkdir(collectionDir);

      for (const chapter of collection.chapters) {
        const chapterId = `${chapter.name} ${chapter.title}`;
        const chapterDir = path.join(collectionDir, chapterId);
        if (!(await fsu.isDirectoryExist(chapterDir))) await fs.mkdir(chapterDir);
      }
    }
  }

  async openChapter(collectionId: string, chapterId: string) {
    // TODO: better check
    if (collectionId.length !== 0 && validateFilename(collectionId)) return undefined;
    if (chapterId.length !== 0 && validateFilename(chapterId)) return undefined;

    const chapterDir = path.join(this.dir, collectionId, chapterId);
    if (!(await fsu.isDirectoryExist(chapterDir))) return undefined;
    return new AccessorChapter(chapterDir);
  }

  private async parseMangaThumb() {
    const possibleThumbFileName = ['thumb.jpg', 'thumb.png', 'thumb.png'];
    for (const filename of possibleThumbFileName) {
      const filepath = path.join(this.dir, filename);
      if (await fsu.isFileExist(filepath)) return filename;
    }
    // TODO: choose first image if thumb not exist
    return undefined;
  }

  private async parseMangaUpdateTime() {
    return fs.stat(this.dir).then((x) => x.mtime.getTime());
  }

  private async parseMangaMetadataOutline(): Promise<MetadataOutline> {
    const filepath = path.join(this.dir, 'metadata.json');
    return fsu.readJSON(filepath).then((json) => {
      // TODO: check json schema
      if (json === undefined) return {};
      return json;
    });
  }

  private async parseMangaMetadataDetail(): Promise<MetadataDetail> {
    const filepath = path.join(this.dir, 'metadata.json');
    return fsu.readJSON(filepath).then((json) => {
      // TODO: check json schema
      if (json === undefined) return {};
      return json;
    });
  }

  private async parseMangaCollections(): Promise<Collection[]> {
    const parseChapterId = (id: string): Chapter => {
      const sep = ' ';
      const sepPosition = id.indexOf(sep);
      const chapter: Chapter = {
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
          const collection: Collection = { id: collectionId, chapters: chapters };
          collections.push(collection);
        }
      }

      // depth 2
      if (collections.length === 0) {
        const chapters = subFolders.map((x) => parseChapterId(x));
        const collection: Collection = { id: '', chapters: chapters };
        collections.push(collection);
      }

      return collections;
    } else {
      // depth 1
      // TODO: add preview
      const chapter: Chapter = { id: '', name: '', title: '' };
      const collection: Collection = { id: '', chapters: [chapter] };
      return [collection];
    }
  }
  // async refreshModifiedTime() {
  //   const tempPath = path.join(this.dir, 'temp.json');
  //   await fsp.open(tempPath, 'w').then((f) => f.close());
  //   await fs.unlinkSync(tempPath);
  // }
}
