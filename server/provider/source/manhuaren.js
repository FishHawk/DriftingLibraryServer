import axios from 'axios';
import crypto from 'crypto';
import moment from 'moment';

import {
  MangaStatus,
  MangaOutline,
  MangaDetail,
  Collection,
  Chapter,
} from '../../model/manga.js';

const lang = 'zh';
const name = '漫画人';
const isLatestSupport = true;

/*
 *  Helper
 */

const pageSize = 20;

function generateGSNHash(params) {
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

function addExtraParam(params) {
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

function parseStatus(status) {
  if (status == 0) return MangaStatus.ONGOING;
  else if (status == 1) return MangaStatus.COMPLETED;
  else return MangaStatus.UNKNOWN;
}

function parseMangaList(mangas) {
  return mangas.map((json) => {
    return new MangaOutline({
      id: json.mangaId,
      title: json.mangaName,
      thumb: json.mangaCoverimageUrl,
      author: json.mangaAuthor,
      status: parseStatus(json.mangaIsOver),
    });
  });
}

function parseChapter(jsonChapter) {
  let name = jsonChapter.sectionName;
  if (jsonChapter.isMustPay === 1) name = '[锁] ' + name;

  return new Chapter({
    id: jsonChapter.sectionId.toString(),
    name: name,
    title: jsonChapter.sectionTitle,
  });
}

function parseMangaDetail(jsonManga) {
  let thumb = jsonManga.mangaCoverimageUrl;
  if (
    thumb === undefined ||
    thumb === '' ||
    thumb === 'http://mhfm5.tel.cdndm5.com/tag/category/nopic.jpg'
  )
    thumb = jsonManga.mangaPicimageUrl;
  if (thumb === undefined || thumb === '') thumb = jsonManga.shareIcon;

  let detail = new MangaDetail({
    source: name,
    id: jsonManga.mangaId.toString(),
    title: jsonManga.mangaName,
    thumb: thumb,
    author: jsonManga.mangaAuthors,
    status: parseStatus(jsonManga.mangaIsOver),
    update: jsonManga.mangaNewestTime,

    description: jsonManga.mangaIntro,
    genre: jsonManga.mangaTheme.split(' '),
  });

  const parseCollection = (title, jsonChapterList) => {
    if (jsonChapterList.length > 0) {
      const chapters = jsonChapterList
        .map((jsonChapter) => parseChapter(jsonChapter))
        .reverse();
      const collecton = new Collection({ title, chapters });
      detail.collections.push(collecton);
    }
  };

  parseCollection('连载', jsonManga.mangaWords);
  parseCollection('单行本', jsonManga.mangaRolls);
  parseCollection('番外', jsonManga.mangaEpisode);

  return detail;
}

function parseChapterContent(jsonImageList) {
  const host = jsonImageList.hostList[0];
  const query = jsonImageList.query;
  return jsonImageList.mangaSectionImages.map((it) => `${host}${it}${query}`);
}

/*
 *  Api
 */

const baseUrl = 'http://mangaapi.manhuaren.com';
const instance = axios.create({
  baseURL: baseUrl,
  timeout: 5000,
  headers: {
    Referer: 'http://www.dm5.com/dm5api/',
    clubReferer: 'http://mangaapi.manhuaren.com/',
    'X-Yq-Yqci': '{"le": "zh"}',
    'User-Agent': 'okhttp/3.11.0',
  },
});

function search(page, keywords) {
  return instance
    .get('/v1/search/getSearchManga', {
      params: addExtraParam({
        keywords,
        start: (pageSize * (page - 1)).toString(),
        limit: pageSize.toString(),
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

function requestPopular(page) {
  return instance
    .get('/v2/manga/getCategoryMangas', {
      params: addExtraParam({
        subCategoryType: '0',
        subCategoryId: '0',
        start: (pageSize * (page - 1)).toString(),
        limit: pageSize.toString(),
        sort: '0',
      }),
    })
    .then((response) => parseMangaList(response.data.response.mangas));
}

function requestLatest(page) {
  return instance
    .get('/v2/manga/getCategoryMangas', {
      params: addExtraParam({
        subCategoryType: '0',
        subCategoryId: '0',
        start: (pageSize * (page - 1)).toString(),
        limit: pageSize.toString(),
        sort: '1',
      }),
    })
    .then((response) => parseMangaList(response.data.response.mangas));
}

function requestMangaDetail(id) {
  return instance
    .get('/v1/manga/getDetail', {
      params: addExtraParam({
        mangaId: id,
      }),
    })
    .then((response) => parseMangaDetail(response.data.response));
}

function requestChapterContent(id) {
  return instance
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

function requestImage(url, stream) {
  return instance({
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

export default {
  lang,
  name,
  isLatestSupport,

  search,
  requestPopular,
  requestLatest,
  requestMangaDetail,
  requestChapterContent,
  requestImage,
};
