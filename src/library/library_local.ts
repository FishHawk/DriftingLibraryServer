import { LibraryAdapter } from './library_adapter';
import { MangaOutline } from '../entity/manga_outline';
import { MangaDetail } from '../entity/manga_detail';
import { parseMangaDetail, parseChapterContent } from './parse';

class LibraryLocal implements LibraryAdapter {
  libraryDir: string;

  constructor(libraryDir: string) {
    this.libraryDir = libraryDir;
  }

  search(lastTime: number, limit: number, keywords: string): Promise<MangaOutline[]> {
    throw new Error('Method not implemented.');
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
    throw new Error('Method not implemented.');
  }
  createManga(mangaId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  deleteManga(mangaId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
