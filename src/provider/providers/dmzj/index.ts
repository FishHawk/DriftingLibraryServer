import axios from 'axios';

import * as Entity from '../../../library/entity';
import { ProviderAdapter } from '../../adapter';
import { parseMangaOutlines, parseMangaDetail, parseChapterContent } from './parse';

export default class Provider extends ProviderAdapter {
  readonly lang: string = 'zh';
  readonly name: string = '动漫之家';
  readonly isLatestSupport: boolean = true;

  private readonly baseUrl = 'http://v3api.dmzj.com';
  private readonly instance = axios.create({
    baseURL: this.baseUrl,
    timeout: 5000,
    headers: {
      Referer: 'http://www.dmzj.com/',
      'User-Agent':
        'Mozilla/5.0 (X11; Linux x86_64) ' +
        'AppleWebKit/537.36 (KHTML, like Gecko) ' +
        'Chrome/56.0.2924.87 ' +
        'Safari/537.36 ' +
        'Tachiyomi/1.0',
    },
  });

  search(page: number, keywords: string): Promise<Entity.MangaOutline[]> {
    keywords = encodeURI(keywords);
    return this.instance
      .get(`/search/show/0/${keywords}/${page - 1}.json`)
      .then((res) => parseMangaOutlines(res.data));
  }

  requestPopular(page: number): Promise<Entity.MangaOutline[]> {
    return this.instance
      .get(`http://v2.api.dmzj.com/classify/0/0/${page - 1}.json`)
      .then((res) => parseMangaOutlines(res.data));
  }

  requestLatest(page: number): Promise<Entity.MangaOutline[]> {
    return this.instance
      .get(`/latest/0/${page - 1}.json`)
      .then((res) => parseMangaOutlines(res.data));
  }

  requestMangaDetail(id: string): Promise<Entity.MangaDetail> {
    return this.instance
      .get(`/comic/comic_${id}.json?version=2.7.019`)
      .then((res) => parseMangaDetail(res.data))
      .then((detail) => {
        detail.providerId = this.name;
        return detail;
      });
  }

  requestChapterContent(id: string): Promise<string[]> {
    const [mid, cid] = id.split('/');
    return this.instance
      .get(`/chapter/${mid}/${cid}.json`)
      .then((res) => parseChapterContent(res.data));
  }

  requestImage(url: string): Promise<Buffer> {
    return this.instance({
      method: 'get',
      url: encodeURI(url),
      responseType: 'arraybuffer',
    }).then((response) => response.data);
  }
}