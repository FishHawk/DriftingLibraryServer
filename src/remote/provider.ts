export interface MangaProviderInfo {
  readonly lang: string;
  readonly name: string;
  readonly isLatestSupport: boolean;
}

export abstract class MangaProvider implements MangaProviderInfo {
  abstract readonly lang: string;
  abstract readonly name: string;
  abstract readonly isLatestSupport: boolean;

  getInfo(): MangaProviderInfo {
    return {
      lang: this.lang,
      name: this.name,
      isLatestSupport: this.isLatestSupport,
    };
  }

  abstract search(page: number, keywords: string): Promise<any>;
  abstract requestPopular(page: number): Promise<any>;
  abstract requestLatest(page: number): Promise<any>;

  abstract requestMangaDetail(id: string): Promise<any>;
  abstract requestChapterContent(id: string): Promise<any>;
  abstract requestImage(url: string, stream: any): Promise<void>;
}
