import axios from 'axios';
import crypto from 'crypto';
import moment from 'moment';

import * as Entity from '../../../library/entity';
import { ProviderAdapter } from '../../adapter';
import { parseMangaOutlines, parseMangaDetail, parseChapterContent } from './parse';

export default class Provider extends ProviderAdapter {
  readonly id: string = 'manhuaren';
  readonly name: string = '漫画人';
  readonly lang: string = 'zh';
  readonly isLatestSupport: boolean = true;

  private readonly pageSize = 20;
  private readonly baseUrl = 'http://mangaapi.manhuaren.com';
  private readonly instance = axios.create({
    baseURL: this.baseUrl,
    timeout: 5000,
    headers: {
      Referer: 'http://www.dm5.com/dm5api/',
      clubReferer: 'http://mangaapi.manhuaren.com/',
      'X-Yq-Yqci': '{"le": "zh"}',
      'User-Agent': 'okhttp/3.11.0',
    },
  });

  search(page: number, keywords: string): Promise<Entity.MangaOutline[]> {
    return this.instance
      .get('/v1/search/getSearchManga', {
        params: addExtraParam({
          keywords,
          start: (this.pageSize * (page - 1)).toString(),
          limit: this.pageSize.toString(),
        }),
      })
      .then(function (res) {
        if (res.data.mangas === undefined) {
          return parseMangaOutlines(res.data.response.result);
        } else {
          return parseMangaOutlines(res.data.mangas);
        }
      });
  }

  requestPopular(page: number): Promise<Entity.MangaOutline[]> {
    return this.instance
      .get('/v2/manga/getCategoryMangas', {
        params: addExtraParam({
          subCategoryType: '0',
          subCategoryId: '0',
          start: (this.pageSize * (page - 1)).toString(),
          limit: this.pageSize.toString(),
          sort: '0',
        }),
      })
      .then((res) => parseMangaOutlines(res.data.response.mangas));
  }

  requestLatest(page: number): Promise<Entity.MangaOutline[]> {
    return this.instance
      .get('/v2/manga/getCategoryMangas', {
        params: addExtraParam({
          subCategoryType: '0',
          subCategoryId: '0',
          start: (this.pageSize * (page - 1)).toString(),
          limit: this.pageSize.toString(),
          sort: '1',
        }),
      })
      .then((res) => parseMangaOutlines(res.data.response.mangas));
  }
  requestMangaDetail(mangaId: string): Promise<Entity.MangaDetail> {
    return this.instance
      .get('/v1/manga/getDetail', { params: addExtraParam({ mangaId }) })
      .then((response) => parseMangaDetail(response.data.response))
      .then((detail) => {
        detail.providerId = this.id;
        return detail;
      });
  }

  requestChapterContent(mangaId: string, chapterId: string): Promise<string[]> {
    return this.instance
      .get('/v1/manga/getRead', {
        params: addExtraParam({
          mangaSectionId: chapterId,
          netType: 4,
          loadreal: 1,
          imageQuality: 2,
        }),
      })
      .then((res) => parseChapterContent(res.data.response));
  }

  requestImage(url: string): Promise<Buffer> {
    return this.instance
      .get(encodeURI(url), { responseType: 'arraybuffer' })
      .then((res) => res.data);
  }
}

function generateGSNHash(params: any) {
  const c = '4e0a48e1c0b54041bce9c8f0e036124d';
  let s = c + 'GET';

  Object.keys(params)
    .sort()
    .forEach(function (it, i) {
      if (it != 'gsn') {
        s += it;
        s += encodeURIComponent(params[it]).replace('*', '%2A');
      }
    });
  s += c;

  const md5 = crypto.createHash('md5');
  return md5.update(s).digest('hex');
}

function addExtraParam(params: any) {
  params.gsm = 'md5';
  params.gft = 'json';
  params.gts = moment().format('YYYY-MM-DD+HH:mm:ss');
  params.gak = 'android_manhuaren2';
  params.gat = '';
  params.gaui = '191909801';
  params.gui = '191909801';
  params.gut = '0';

  const gsn = generateGSNHash(params);
  params.gsn = gsn;
  return params;
}
