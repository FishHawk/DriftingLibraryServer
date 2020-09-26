import { Option, ProviderAdapter } from '../adapter';
import { Image } from '../../../util/image';

import Api from './api';
import Constant from './constant';
import Parser from './parser';

export default class Provider extends ProviderAdapter {
  readonly id: string = 'manhuaren';
  readonly name: string = '漫画人';
  readonly lang: string = 'zh';

  readonly optionModels = {
    popular: {
      type: Constant.rankType.map((x) => x.name),
    },
    latest: {
      type: ['最新更新', '最新上架'],
    },
    category: {
      type: Constant.categoryType.map((x) => x.name),
      sort: Constant.categorySort.map((x) => x.name),
    },
  };

  readonly api: Api = new Api();

  async search(page: number, keywords: string) {
    return this.api.getSearchManga(page, keywords).then((res) => {
      if (res.data.mangas === undefined) {
        return Parser.parseMangaOutlines(res.data.response.result);
      } else {
        return Parser.parseMangaOutlines(res.data.mangas);
      }
    });
  }

  async requestPopular(page: number, option: Option) {
    if (!Provider.checkOptionIntegrity(option, this.optionModels.popular))
      return undefined;

    const type = Constant.rankType[option.type].value;
    return this.api
      .getRank(page, type)
      .then((res) => Parser.parseMangaOutlines(res.data.response.mangas));
  }

  async requestLatest(page: number, option: Option) {
    if (!Provider.checkOptionIntegrity(option, this.optionModels.latest))
      return undefined;

    const type = option.type;
    if (type === 0)
      return this.api
        .getUpdate(page)
        .then((res) => Parser.parseMangaOutlines(res.data.response.mangas));
    if (type === 1)
      return this.api
        .getRelease(page)
        .then((res) => Parser.parseMangaOutlines(res.data.response.mangas));
  }

  async requestCategory(page: number, option: Option) {
    if (!Provider.checkOptionIntegrity(option, this.optionModels.category))
      return undefined;

    const { subId, subType } = Constant.categoryType[option.type];
    const sort = Constant.categorySort[option.sort].value;
    return this.api
      .getCategoryMangas(page, subId, subType, sort)
      .then((res) => Parser.parseMangaOutlines(res.data.response.mangas));
  }

  async requestMangaDetail(mangaId: string) {
    return this.api
      .getDetail(mangaId)
      .then((response) => Parser.parseMangaDetail(response.data.response))
      .then((detail) => {
        detail.providerId = this.id;
        return detail;
      });
  }

  async requestChapterContent(_mangaId: string, chapterId: string) {
    return this.api
      .getRead(chapterId)
      .then((res) => Parser.parseChapterContent(res.data.response));
  }

  async requestImage(url: string) {
    return this.api.instance
      .get(encodeURI(url), { responseType: 'arraybuffer' })
      .then((res) => {
        const mime = res.headers['content-type'];
        const image = Image.fromMime(mime, res.data);
        if (image !== undefined) return image;
        throw new Error('unknown content type');
      });
  }
}
