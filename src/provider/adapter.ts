import { MangaOutline, MangaDetail } from '../library/entity';

export interface ProviderInfo {
  readonly lang: string;
  readonly name: string;
  readonly isLatestSupport: boolean;
}

export abstract class ProviderAdapter implements ProviderInfo {
  abstract readonly lang: string;
  abstract readonly name: string;
  abstract readonly isLatestSupport: boolean;

  getInfo(): ProviderInfo {
    return {
      lang: this.lang,
      name: this.name,
      isLatestSupport: this.isLatestSupport,
    };
  }

  abstract search(page: number, keywords: string): Promise<MangaOutline[]>;
  abstract requestPopular(page: number): Promise<MangaOutline[]>;
  abstract requestLatest(page: number): Promise<MangaOutline[]>;

  abstract requestMangaDetail(mangaId: string): Promise<MangaDetail>;
  abstract requestChapterContent(mangaId: string, chapterId: string): Promise<string[]>;
  abstract requestImage(url: string): Promise<Buffer>;
}
