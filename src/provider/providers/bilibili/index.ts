import moment from 'moment';
import { Option, ProviderAdapter } from '../adapter';

import Api from './api';
import Constant from './constant';
import Parser from './parser';

export default class Provider extends ProviderAdapter {
  readonly id: string = 'bilibili';
  readonly name: string = '哔哩哔哩漫画';
  readonly lang: string = 'zh';

  readonly optionModels = {
    popular: {
      type: Constant.homeHotType.map((x) => x.name),
    },
    latest: {},
    category: {
      style: Constant.classStyle.map((x) => x.name),
      area: Constant.classArea.map((x) => x.name),
      isFinish: Constant.classIsFinish.map((x) => x.name),
      isFree: Constant.classIsFree.map((x) => x.name),
      order: Constant.classOrder.map((x) => x.name),
    },
  };

  readonly api = new Api();

  async search(page: number, keywords: string) {
    return this.api.search(page, keywords).then(Parser.parseSearchResponse);
  }

  async requestPopular(page: number, option: Option) {
    if (!Provider.checkOptionIntegrity(option, this.optionModels.popular))
      return undefined;

    const type = Constant.homeHotType[option.type].value;
    if (page > 1) return [];
    return this.api.getHomeHot(type).then(Parser.parsePopularResponse);
  }

  async requestLatest(page: number) {
    return this.api
      .getDailyPush(page, moment().format('YYYY-MM-DD'))
      .then(Parser.parseLatestResponse);
  }

  async requestCategory(page: number, option: Option) {
    if (!Provider.checkOptionIntegrity(option, this.optionModels.category))
      return undefined;

    const style = Constant.classStyle[option.style].value;
    const area = Constant.classArea[option.area].value;
    const isFinish = Constant.classIsFinish[option.isFinish].value;
    const isFree = Constant.classIsFree[option.isFree].value;
    const order = Constant.classOrder[option.order].value;
    return this.api
      .getClassPage(page, style, area, isFinish, isFree, order)
      .then((res) => Parser.parseCategoryResponse(res));
  }

  async requestMangaDetail(mangaId: string) {
    return this.api
      .getComicDetail(mangaId)
      .then((res) => Parser.parseMangaDetail(res.data.data))
      .then((detail) => {
        detail.providerId = this.id;
        return detail;
      });
  }

  async requestChapterContent(mangaId: string, chapterId: string) {
    return this.api
      .getChapterIndex(chapterId)
      .then((res) => Parser.parseChapterContent(mangaId, chapterId, res.data))
      .then((json) => this.api.getChapterImageToken(json.pics))
      .then((res) =>
        res.data.data.map((it: any) => `${it.url}?token=${it.token}`)
      );
  }

  async requestImage(url: string): Promise<Buffer> {
    return this.api.instance
      .get(url, { responseType: 'arraybuffer' })
      .then((res) => res.data);
  }
}
