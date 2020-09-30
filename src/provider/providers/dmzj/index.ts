import { Option, ProviderAdapter } from '../adapter';
import { Image } from '../../../util/image';

import Api from './api';
import Constant from './constant';
import Parser from './parser';

export default class Provider extends ProviderAdapter {
  readonly id = 'dmzj';
  readonly name = '动漫之家';
  readonly lang = 'zh';

  readonly optionModels = {
    popular: {
      type: Constant.rankType.map((x) => x.name),
      range: Constant.rankRange.map((x) => x.name),
    },
    latest: {
      type: Constant.latestType.map((x) => x.name),
    },
    category: {
      genre: Constant.classifyGenre.map((x) => x.name),
      reader: Constant.classifyReader.map((x) => x.name),
      status: Constant.classifyStatus.map((x) => x.name),
      area: Constant.classifyArea.map((x) => x.name),
      sort: Constant.classifySort.map((x) => x.name),
    },
  };

  readonly api = new Api();

  async search(page: number, keywords: string) {
    return this.api
      .search(page - 1, keywords)
      .then((res) => Parser.parseMangaOutlines(res.data));
  }

  async requestPopular(page: number, option: Option) {
    if (!Provider.checkOptionIntegrity(option, this.optionModels.popular))
      return undefined;

    const type = Constant.rankType[option.type].value;
    const range = Constant.rankRange[option.range].value;
    return this.api
      .getRank(page - 1, type, range)
      .then((res) => Parser.parseMangaOutlines(res.data));
  }

  async requestLatest(page: number, option: Option) {
    if (!Provider.checkOptionIntegrity(option, this.optionModels.latest))
      return undefined;

    const type = Constant.latestType[option.type].value;
    return this.api
      .getLatest(page - 1, type)
      .then((res) => Parser.parseMangaOutlines(res.data));
  }

  async requestCategory(page: number, option: Option) {
    if (!Provider.checkOptionIntegrity(option, this.optionModels.category))
      return undefined;

    const genre = Constant.classifyGenre[option.genre].value;
    const reader = Constant.classifyReader[option.reader].value;
    const status = Constant.classifyStatus[option.status].value;
    const area = Constant.classifyArea[option.area].value;
    const sort = Constant.classifySort[option.sort].value;
    return this.api
      .getClassify(page - 1, genre, reader, status, area, sort)
      .then((res) => Parser.parseMangaOutlines(res.data));
  }

  async requestMangaDetail(mangaId: string) {
    return this.api
      .getComic(mangaId)
      .then((res) => Parser.parseMangaDetail(res.data))
      .then((detail) => {
        detail.providerId = this.id;
        return detail;
      });
  }

  async requestChapterContent(
    mangaId: string,
    chapterId: string
  ): Promise<string[]> {
    return this.api
      .getChapter(mangaId, chapterId)
      .then((res) => Parser.parseChapterContent(res.data));
  }

  async requestImage(url: string) {
    return this.api.instance
      .get(encodeURI(url), { responseType: 'stream' })
      .then((res) => {
        const mime = res.headers['content-type'];
        const image = Image.fromMime(mime, res.data);
        if (image !== undefined) return image;
        throw new Error('unknown content type');
      });
  }
}
