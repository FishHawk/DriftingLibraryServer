import axios from 'axios';
import crypto from 'crypto';
import moment from 'moment';

import { MangaOutline } from '../../entity/manga_outline';
import { Status } from '../../entity/manga_status';
import { Chapter, MangaDetail, Collection, Tag } from '../../entity/manga_detail';

import { ProviderAdapter } from '../provider_adapter';

/*
 *  Param helper
 */

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

/*
 *  Parsing
 */

function parseStatus(status: any): Status {
  if (status === 0) return Status.Ongoing;
  else if (status === 1) return Status.Completed;
  else return Status.Unknown;
}

function parseMangaList(mangas: any): MangaOutline[] {
  return mangas.map((json: any) => {
    const outline: MangaOutline = {
      id: json.mangaId,
      title: json.mangaName,
      thumb: json.mangaCoverimageUrl,
      authors: json.mangaAuthor,
      status: parseStatus(json.mangaIsOver),
      updateTime: undefined,
    };
    return outline;
  });
}

function parseChapter(jsonChapter: any) {
  let name = jsonChapter.sectionName;
  if (jsonChapter.isMustPay === 1) name = '[锁] ' + name;

  const chapter: Chapter = {
    id: jsonChapter.sectionId.toString(),
    name: name,
    title: jsonChapter.sectionTitle,
  };
  return chapter;
}

function parseMangaDetail(jsonManga: any) {
  let thumb = jsonManga.mangaCoverimageUrl;
  if (
    thumb === undefined ||
    thumb === '' ||
    thumb === 'http://mhfm5.tel.cdndm5.com/tag/category/nopic.jpg'
  )
    thumb = jsonManga.mangaPicimageUrl;
  if (thumb === undefined || thumb === '') thumb = jsonManga.shareIcon;

  let detail: MangaDetail = {
    source: '漫画人',
    id: jsonManga.mangaId.toString(),
    title: jsonManga.mangaName,
    thumb: thumb,
    authors: jsonManga.mangaAuthors,
    status: parseStatus(jsonManga.mangaIsOver),
    updateTime: moment(jsonManga.mangaNewestTime).valueOf(),

    description: jsonManga.mangaIntro,
    tags: [],
    collections: [],
  };

  // parse tag
  const tag: Tag = {
    key: 'genre',
    value: jsonManga.mangaTheme.split(' '),
  };
  detail.tags.push(tag);

  // parse collections
  const parseCollection = (id: string, jsonChapterList: any) => {
    if (jsonChapterList.length > 0) {
      const chapters = jsonChapterList
        .map((jsonChapter: any) => parseChapter(jsonChapter))
        .reverse();
      const collecton: Collection = { id, chapters };
      detail.collections.push(collecton);
    }
  };

  parseCollection('连载', jsonManga.mangaWords);
  parseCollection('单行本', jsonManga.mangaRolls);
  parseCollection('番外', jsonManga.mangaEpisode);

  return detail;
}

function parseChapterContent(jsonImageList: any): string[] {
  const host = jsonImageList.hostList[0];
  const query = jsonImageList.query;
  return jsonImageList.mangaSectionImages.map((it: any) => `${host}${it}${query}`);
}

export default class ProviderManhuaren extends ProviderAdapter {
  readonly lang: string = 'zh';
  readonly name: string = '漫画人';
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

  search(page: number, keywords: string): Promise<MangaOutline[]> {
    return this.instance
      .get('/v1/search/getSearchManga', {
        params: addExtraParam({
          keywords,
          start: (this.pageSize * (page - 1)).toString(),
          limit: this.pageSize.toString(),
        }),
      })
      .then(function (response) {
        if (response.data.mangas === undefined) {
          return parseMangaList(response.data.response.result);
        } else {
          return parseMangaList(response.data.mangas);
        }
      });
  }

  requestPopular(page: number): Promise<MangaOutline[]> {
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
      .then((response) => parseMangaList(response.data.response.mangas));
  }

  requestLatest(page: number): Promise<MangaOutline[]> {
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
      .then((response) => parseMangaList(response.data.response.mangas));
  }
  requestMangaDetail(id: string): Promise<MangaDetail> {
    return this.instance
      .get('/v1/manga/getDetail', {
        params: addExtraParam({
          mangaId: id,
        }),
      })
      .then((response) => parseMangaDetail(response.data.response));
  }

  requestChapterContent(id: string): Promise<any> {
    return this.instance
      .get('/v1/manga/getRead', {
        params: addExtraParam({
          mangaSectionId: id,
          netType: 4,
          loadreal: 1,
          imageQuality: 2,
        }),
      })
      .then((response) => parseChapterContent(response.data.response));
  }

  requestImage(url: string, stream: any): Promise<void> {
    return this.instance({
      method: 'get',
      url: encodeURI(url),
      responseType: 'stream',
    }).then(
      (response) =>
        new Promise((resolve, reject) => {
          stream.on('finish', resolve);
          stream.on('error', reject);
          response.data.pipe(stream);
        })
    );
  }
}
