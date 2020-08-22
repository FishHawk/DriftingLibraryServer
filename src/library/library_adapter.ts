import { MangaDetail } from '../entity/manga_detail';
import { MangaOutline } from '../entity/manga_outline';

export interface LibraryAdapter {
  readonly libraryDir: string;

  search(lastTime: number, limit: number, keywords: string): Promise<MangaOutline[]>;
  getMangaDetail(mangaId: string): Promise<MangaDetail | undefined>;
  getChapterContent(
    mangaId: string,
    collectionId: string,
    chapterId: string
  ): Promise<string[] | undefined>;

  isMangaExist(mangaId: string): Promise<boolean>;
  createManga(mangaId: string): Promise<void>;
  deleteManga(mangaId: string): Promise<void>;
}
