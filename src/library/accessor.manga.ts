import path from 'path';

import * as Model from '@data';
import * as fs from '@util/fs';
import { validateString } from '@util/validator/validator';

import { ChapterAccessor } from './accessor.chapter';

export class MangaAccessor {
  static readonly filenameValidator = validateString().isFilename();

  private readonly dir: string;

  constructor(libraryDir: string, readonly id: string) {
    this.dir = path.join(libraryDir, id);
  }

  async getOutline(): Promise<Model.MangaOutline> {
    let outline: Model.MangaOutline = {
      id: this.id,
      updateTime: await this.getUpdateTime(),
      hasNewMark: await this.hasNewMark(),
      metadata: await this.getMetadataOutline(),
    };
    if (await this.hasSource()) outline.source = await this.getSource();
    return outline;
  }

  async getDetail(): Promise<Model.MangaDetail> {
    let detail: Model.MangaDetail = {
      id: this.id,
      updateTime: await this.getUpdateTime(),
      metadata: await this.getMetadataDetail(),
      collections: await this.getCollections(),
    };
    if (await this.hasSource()) detail.source = await this.getSource();
    return detail;
  }

  /* thumb */
  async getThumb() {
    const imageFiles = await fs.listImageFile(this.dir);
    const thumbFiles = imageFiles.filter(
      (filename) => fs.getBasename(filename) === 'thumb'
    );

    let thumbFilename;
    if (thumbFiles.length > 0) thumbFilename = thumbFiles[0];
    else if (imageFiles.length > 0) thumbFilename = imageFiles[0];
    else return undefined;

    const imagePath = path.join(this.dir, thumbFilename);
    return fs.Image.fromExt(
      fs.getExtension(thumbFilename),
      fs.createReadStream(imagePath)
    );
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

  /* update time */
  private getUpdateTime() {
    return fs.getMTime(this.dir);
  }

  refreshUpdateTime() {
    return fs.setMTime(this.dir, Date.now());
  }

  /* new mark */
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

  /* source */
  private getSourcePath() {
    return path.join(this.dir, 'source.json');
  }

  async hasSource() {
    const filepath = this.getSourcePath();
    return await fs.isFileExist(filepath);
  }

  async getSource() {
    // TODO: check json schema
    const filepath = this.getSourcePath();
    const json = await fs.readJSON(filepath);
    return json as unknown as Model.MangaSource;
  }

  async setSource(source: Model.MangaSource) {
    const filepath = this.getSourcePath();
    await fs.writeJSON(filepath, source);
    return this;
  }

  async deleteSource() {
    const filepath = this.getSourcePath();
    await fs.unlink(filepath);
  }

  /* metadata */
  private getMetadataPath() {
    return path.join(this.dir, 'metadata.json');
  }

  private async getMetadataOutline(): Promise<Model.MetadataOutline> {
    // TODO: check json schema
    const filepath = this.getMetadataPath();
    let json = await fs.readJSON(filepath);
    if (json === undefined) json = {};
    return json as unknown as Model.MetadataOutline;
  }

  private async getMetadataDetail(): Promise<Model.MetadataDetail> {
    // TODO: check json schema
    const filepath = this.getMetadataPath();
    let json = await fs.readJSON(filepath);
    if (json === undefined) json = {};
    return json as unknown as Model.MetadataDetail;
  }

  async setMetadata(metadata: Model.MetadataDetail) {
    const filepath = this.getMetadataPath();
    await fs.writeJSON(filepath, metadata);
  }

  /* collection */
  private async getCollections(): Promise<Model.Collection[]> {
    const parseChapterId = (id: string): Model.Chapter => {
      const sep = ' ';
      const sepPosition = id.indexOf(sep);
      const chapter: Model.Chapter = {
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
          const collection: Model.Collection = {
            id: collectionId,
            chapters: chapters,
          };
          collections.push(collection);
        }
      }

      // depth 2
      if (collections.length === 0) {
        const chapters = subFolders.map((x) => parseChapterId(x));
        const collection: Model.Collection = { id: '', chapters: chapters };
        collections.push(collection);
      }

      return collections;
    } else {
      // depth 1
      // TODO: add preview
      const chapter: Model.Chapter = { id: '', name: '', title: '' };
      const collection: Model.Collection = { id: '', chapters: [chapter] };
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
