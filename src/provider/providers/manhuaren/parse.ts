import moment from 'moment';

import * as Entity from '../../../library/entity';

function parseStatus(status: any): Entity.Status {
  if (status === 0) return Entity.Status.Ongoing;
  else if (status === 1) return Entity.Status.Completed;
  else return Entity.Status.Unknown;
}

export function parseMangaList(json: any): Entity.MangaOutline[] {
  return json.map((it: any) => {
    const metadata: Entity.MetadataOutline = {
      title: it.mangaName,
      authors: [it.mangaAuthor],
      status: parseStatus(it.mangaIsOver),
    };
    const outline: Entity.MangaOutline = {
      id: it.mangaId,
      thumb: it.mangaCoverimageUrl,
      updateTime: undefined,
      metadata: metadata,
    };
    return outline;
  });
}

function parseChapter(json: any): Entity.Chapter {
  let name = json.sectionName;
  if (json.isMustPay === 1) name = '[锁] ' + name;

  const chapter: Entity.Chapter = {
    id: json.sectionId.toString(),
    name: name,
    title: json.sectionTitle,
  };
  return chapter;
}

export function parseMangaDetail(json: any): Entity.MangaDetail {
  let thumb = json.mangaCoverimageUrl;
  if (
    thumb === undefined ||
    thumb === '' ||
    thumb === 'http://mhfm5.tel.cdndm5.com/tag/category/nopic.jpg'
  )
    thumb = json.mangaPicimageUrl;
  if (thumb === undefined || thumb === '') thumb = json.shareIcon;

  // parse tag
  const tag: Entity.Tag = {
    key: 'genre',
    value: json.mangaTheme.split(' '),
  };

  // parse metadata
  const metadata: Entity.MetadataDetail = {
    title: json.mangaName,
    authors: json.mangaAuthors,
    status: parseStatus(json.mangaIsOver),
    description: json.mangaIntro,
    tags: [tag],
  };

  // parse collections
  const collections: Entity.Collection[] = [];
  const parseCollection = (id: string, json: any) => {
    if (json.length > 0) {
      const chapters = json.map((it: any) => parseChapter(it)).reverse();
      const collecton: Entity.Collection = { id, chapters };
      collections.push(collecton);
    }
  };

  parseCollection('连载', json.mangaWords);
  parseCollection('单行本', json.mangaRolls);
  parseCollection('番外', json.mangaEpisode);

  // parse detail
  const detail: Entity.MangaDetail = {
    providerId: '漫画人',
    id: json.mangaId.toString(),
    thumb: thumb,
    updateTime: moment(json.mangaNewestTime).valueOf(),
    metadata: metadata,
    collections: collections,
  };

  return detail;
}

export function parseChapterContent(json: any): string[] {
  const host = json.hostList[0];
  const query = json.query;
  return json.mangaSectionImages.map((it: any) => `${host}${it}${query}`);
}
