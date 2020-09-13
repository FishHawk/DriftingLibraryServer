import { MangaOutline, MangaDetail } from '../../library/entity';

export interface ProviderInfo {
  readonly id: string;
  readonly name: string;
  readonly lang: string;
  readonly isLatestSupport: boolean;
}

export abstract class ProviderAdapter implements ProviderInfo {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly lang: string;
  abstract readonly isLatestSupport: boolean;

  getInfo(): ProviderInfo {
    return {
      id: this.id,
      name: this.name,
      lang: this.lang,
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
