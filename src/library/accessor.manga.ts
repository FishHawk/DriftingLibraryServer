import path from 'path';

import * as fs from '../util/fs';
import { validateString } from '../util/validator/validator';

import * as Entity from './entity';
import { ChapterAccessor } from './accessor.chapter';

export class MangaAccessor {
  static readonly filenameValidator = validateString().isFilename();

  private readonly dir: string;

  constructor(libraryDir: string, readonly id: string) {
    this.dir = path.join(libraryDir, id);
  }

  async getOutline(): Promise<Entity.MangaOutline> {
    const mangaOutline: Entity.MangaOutline = {
      id: this.id,
      thumb: await this.getThumb(),
      updateTime: await this.getUpdateTime(),
      hasNewMark: await this.hasNewMark(),
      metadata: await this.getMetadataOutline(),
    };
    return mangaOutline;
  }

  async getDetail(): Promise<Entity.MangaDetail> {
    const mangaDetail: Entity.MangaDetail = {
      id: this.id,
      thumb: await this.getThumb(),
      updateTime: await this.getUpdateTime(),
      metadata: await this.getMetadataDetail(),
      collections: await this.getCollections(),
    };
    return mangaDetail;
  }

  private async getThumb() {
    const imageFiles = await fs.listImageFile(this.dir);
    const thumbFiles = imageFiles.filter(
      (filename) => fs.getBasename(filename) === 'thumb'
    );

    if (thumbFiles.length >= 0) return thumbFiles[0];
    if (imageFiles.length >= 0) return imageFiles[0];
    return undefined;
  }

  async setThumb(thumb: fs.Image) {
    // delete old thumb
    await Promise.all(
      (await fs.listImageFile(this.dir))
        .filter((filename) => fs.getBasename(filename) === 'thumb')
        .map((filename) => fs.unlink(path.join(this.dir, filename)))
    );

    // save new thumb
    const thumbPath = path.join(this.dir, `thumb.${thumb.ext}`);
    await thumb.pipe(fs.createWriteStream(thumbPath));
    return this;
  }

  private getUpdateTime() {
    return fs.getMTime(this.dir);
  }

  refreshUpdateTime() {
    return fs.setMTime(this.dir, Date.now());
  }

  private async hasNewMark() {
    const markPath = path.join(this.dir, '.new');
    return fs.isFileExist(markPath);
  }

  async addNewMark() {
    const markPath = path.join(this.dir, '.new');
    if (!(await fs.isFileExist(markPath))) await fs.writeJSON(markPath, {});
  }

  async removeNewMark() {
    const markPath = path.join(this.dir, '.new');
    if (await fs.isFileExist(markPath)) await fs.unlink(markPath);
  }

  private getMetadataOutline(): Promise<Entity.MetadataOutline> {
    const filepath = path.join(this.dir, 'metadata.json');
    return fs.readJSON(filepath).then((json) => {
      // TODO: check json schema
      if (json === undefined) return {};
      return json;
    });
  }

  private getMetadataDetail(): Promise<Entity.MetadataDetail> {
    const filepath = path.join(this.dir, 'metadata.json');
    return fs.readJSON(filepath).then((json) => {
      // TODO: check json schema
      if (json === undefined) return {};
      return json;
    });
  }

  async setMetadata(metadata: Entity.MetadataDetail) {
    const matedataPath = path.join(this.dir, 'metadata.json');
    await fs.writeJSON(matedataPath, metadata);
    return this;
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

    const subFolders = await fs.listDirectory(this.dir, 'natural');
    if (subFolders.length != 0) {
      let collections = [];

      // depth 3
      for (const collectionId of subFolders) {
        const chapters = await fs
          .listDirectory(path.join(this.dir, collectionId), 'natural')
          .then((list) => list.map(parseChapterId));
        if (chapters.length > 0) {
          const collection: Entity.Collection = {
            id: collectionId,
            chapters: chapters,
          };
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

  /* chapter */
  async getChapter(collectionId: string, chapterId: string) {
    if (!this.validateCollectionId(collectionId)) return undefined;
    if (!this.validateChapterId(chapterId)) return undefined;

    const chapterDir = path.join(this.dir, collectionId, chapterId);
    if (!(await fs.isDirectoryExist(chapterDir))) return undefined;

    return new ChapterAccessor(chapterDir);
  }

  async getOrCreateChapter(collectionId: string, chapterId: string) {
    if (!this.validateCollectionId(collectionId)) return undefined;
    if (!this.validateChapterId(chapterId)) return undefined;

    const chapterDir = path.join(this.dir, collectionId, chapterId);
    if (!(await fs.isDirectoryExist(chapterDir)))
      await fs.mkdir(chapterDir, { recursive: true });

    const accessor = new ChapterAccessor(chapterDir);
    await accessor.addUncompleteMark();
    return accessor;
  }

  private validateCollectionId(collectionId: string) {
    return (
      collectionId.length === 0 ||
      MangaAccessor.filenameValidator.validate(collectionId)
    );
  }
  private validateChapterId(chapterId: string) {
    return (
      chapterId.length === 0 ||
      MangaAccessor.filenameValidator.validate(chapterId)
    );
  }
}
