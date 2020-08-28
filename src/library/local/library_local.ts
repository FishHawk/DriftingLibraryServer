import { MangaOutline } from '../../entity/manga_outline';
import { MangaDetail } from '../../entity/manga_detail';

import { LibraryAdapter } from '../library_adapter';

import {
  parseMangaDetail,
  parseChapterContent,
  removeManga,
  createManga,
  isMangaExist,
} from './parse';
import { searchLibrary } from './search';
import { validateMangaId } from './validate';

export class LibraryLocal implements LibraryAdapter {
  libraryDir: string;

  constructor(libraryDir: string) {
    this.libraryDir = libraryDir;
  }

  search(lastTime: number, limit: number, keywords: string): Promise<MangaOutline[]> {
    return searchLibrary(this.libraryDir, lastTime, limit, keywords);
  }

  getMangaDetail(mangaId: string): Promise<MangaDetail | undefined> {
    return parseMangaDetail(this.libraryDir, mangaId);
  }
  getChapterContent(
    mangaId: string,
    collectionId: string,
    chapterId: string
  ): Promise<string[] | undefined> {
    return parseChapterContent(this.libraryDir, mangaId, collectionId, chapterId);
  }

  isMangaExist(mangaId: string): Promise<boolean> {
    return isMangaExist(this.libraryDir, mangaId);
  }
  createManga(mangaId: string): Promise<void> {
    return createManga(this.libraryDir, mangaId);
  }
  deleteManga(mangaId: string): Promise<void> {
    return removeManga(this.libraryDir, mangaId);
  }

  validateMangaId(mangaId: string): boolean {
    return validateMangaId(mangaId);
  }
}
