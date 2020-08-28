import path from 'path';
import fs from 'fs/promises';

import { MangaOutline } from '../../entity/manga_outline';
import { MangaDetail, MetadataDetail } from '../../entity/manga_detail';
import * as fsu from '../../util/fs';

import { LibraryAdapter } from '../adapter';

import { parseMangaDetail } from './parse';
import { searchLibrary } from './search';
import { validateMangaId, validateCollectionId, validateChapterId } from './validate';

export class LibraryLocal implements LibraryAdapter {
  constructor(readonly libraryDir: string) {}

  /*
   * Library
   */
  async search(lastTime: number, limit: number, keywords: string): Promise<MangaOutline[]> {
    return searchLibrary(this.libraryDir, lastTime, limit, keywords);
  }

  async isMangaExist(mangaId: string): Promise<boolean> {
    if (this.validateMangaId(mangaId)) return false;
    const mangaDir = path.join(this.libraryDir, mangaId);
    return fsu.isDirectoryExist(mangaDir);
  }

  async createManga(mangaId: string): Promise<void> {
    const mangaDir = path.join(this.libraryDir, mangaId);
    if (fsu.isDirectoryExist(mangaDir)) return;
    return fs.mkdir(mangaDir);
  }

  async deleteManga(mangaId: string): Promise<void> {
    const mangaDir = path.join(this.libraryDir, mangaId);
    if (!fsu.isDirectoryExist(mangaDir)) return;
    return fs.rmdir(mangaDir, { recursive: true });
  }

  validateMangaId(mangaId: string): boolean {
    return validateMangaId(mangaId);
  }

  /*
   * Manga
   */
  async getMangaDetail(mangaId: string): Promise<MangaDetail | undefined> {
    if (validateMangaId(mangaId)) return undefined;

    const mangaDir = path.join(this.libraryDir, mangaId);
    if (!fsu.isDirectoryExist(mangaDir)) return undefined;

    return parseMangaDetail(this.libraryDir, mangaId);
  }

  /*
   * Chapter
   */
  async getChapterContent(
    mangaId: string,
    collectionId: string,
    chapterId: string
  ): Promise<string[] | undefined> {
    if (
      validateMangaId(mangaId) &&
      validateCollectionId(collectionId) &&
      validateChapterId(chapterId)
    )
      return undefined;

    const chapterDir = path.join(this.libraryDir, mangaId, collectionId, chapterId);
    if (!(await fsu.isDirectoryExist(chapterDir))) return undefined;

    return fsu.listImageFileWithNaturalOrder(chapterDir);
  }
}
