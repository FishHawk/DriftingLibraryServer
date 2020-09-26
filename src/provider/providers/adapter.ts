import { MangaOutline, MangaDetail } from '../../library/entity';
import { Image } from '../../util/image';

export type OptionModel = Record<string, string[]>;
export type Option = Record<string, number>;

export type ProviderConfig = Record<string, any>;

export interface ProviderInfo {
  readonly id: string;
  readonly name: string;
  readonly lang: string;
}

export interface ProviderDetail extends ProviderInfo {
  readonly optionModels: {
    popular: OptionModel;
    latest: OptionModel;
    category: OptionModel;
  };
}

export abstract class ProviderAdapter implements ProviderDetail {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly lang: string;

  abstract readonly optionModels: {
    popular: OptionModel;
    latest: OptionModel;
    category: OptionModel;
  };

  getInfo(): ProviderInfo {
    return { id: this.id, name: this.name, lang: this.lang };
  }
  getDetail(): ProviderDetail {
    return { ...this.getInfo(), optionModels: this.optionModels };
  }
  applyConfig(_config: ProviderConfig) {}

  protected static checkOptionIntegrity(filter: Option, model: OptionModel) {
    for (const key in model) {
      if (!(filter[key] in model[key])) return false;
    }
    return true;
  }

  abstract search(page: number, keywords: string): Promise<MangaOutline[]>;

  abstract requestPopular(
    page: number,
    filters: Option
  ): Promise<MangaOutline[] | undefined>;

  abstract requestLatest(
    page: number,
    filters: Option
  ): Promise<MangaOutline[] | undefined>;

  abstract requestCategory(
    page: number,
    filters: Option
  ): Promise<MangaOutline[] | undefined>;

  abstract requestMangaDetail(mangaId: string): Promise<MangaDetail>;

  abstract requestChapterContent(
    mangaId: string,
    chapterId: string
  ): Promise<string[]>;

  abstract requestImage(url: string): Promise<Image>;
}
