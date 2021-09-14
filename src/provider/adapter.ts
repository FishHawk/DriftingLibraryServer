import * as Model from '@data';
import { Image } from '@util/fs/image';

export type OptionModel = Record<string, string[]>;
export type Option = Record<string, number>;

export interface ProviderDetail extends Model.Provider {
  readonly optionModels: {
    popular: OptionModel;
    latest: OptionModel;
    category: OptionModel;
  };
}

export abstract class ProviderAdapter implements ProviderDetail {
  abstract readonly name: string;
  abstract readonly lang: string;

  abstract readonly optionModels: {
    popular: OptionModel;
    latest: OptionModel;
    category: OptionModel;
  };

  static checkOption(option: Option, model: OptionModel) {
    for (const key in model) {
      if (!(option[key] in model[key])) return false;
    }
    return true;
  }

  getInfo(): Model.Provider {
    return { name: this.name, lang: this.lang };
  }
  getDetail(): ProviderDetail {
    return { ...this.getInfo(), optionModels: this.optionModels };
  }

  abstract getIcon(): Image;

  abstract search(
    page: number,
    keywords: string
  ): Promise<Model.MangaOutline[]>;

  abstract requestPopular(
    page: number,
    filters: Option
  ): Promise<Model.MangaOutline[]>;

  abstract requestLatest(
    page: number,
    filters: Option
  ): Promise<Model.MangaOutline[]>;

  abstract requestCategory(
    page: number,
    filters: Option
  ): Promise<Model.MangaOutline[]>;

  abstract requestMangaDetail(mangaId: string): Promise<Model.MangaDetail>;

  abstract requestChapterContent(
    mangaId: string,
    chapterId: string
  ): Promise<string[]>;

  abstract requestImage(url: string): Promise<Image>;
}
