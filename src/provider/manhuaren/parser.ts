import moment from 'moment';

import * as Entity from '@data';

function parseStatus(status: any): Entity.MangaStatus {
  if (status === 0) return Entity.MangaStatus.Ongoing;
  else if (status === 1) return Entity.MangaStatus.Completed;
  else return Entity.MangaStatus.Unknown;
}

function parseUpdateTime(time: any): number | undefined {
  if (time === undefined) return undefined;
  return moment(time).valueOf();
}

function parseChapter(json: any): Entity.Chapter {
  const prefix = json.isMustPay === 1 ? '[X] ' : '';
  const chapter: Entity.Chapter = {
    id: json.sectionId.toString(),
    name: prefix + json.sectionName,
    title: prefix + json.sectionTitle,
  };
  return chapter;
}

function parseMangaOutlines(json: any): Entity.MangaOutline[] {
  return json.map((it: any) => {
    const metadata: Entity.MetadataOutline = {
      title: it.mangaName,
      authors: it.mangaAuthor.split(','),
      status: parseStatus(it.mangaIsOver),
    };
    const outline: Entity.MangaOutline = {
      id: it.mangaId,
      cover: it.mangaCoverimageUrl,
      updateTime: parseUpdateTime(it.mangaNewestTime),
      metadata: metadata,
    };
    return outline;
  });
}

function parseMangaDetail(json: any): Entity.MangaDetail {
  let cover = json.mangaPicimageUrl;
  // let cover = json.mangaCoverimageUrl;
  if (
    cover === undefined ||
    cover === '' ||
    cover === 'http://mhfm5.tel.cdndm5.com/tag/category/nopic.jpg'
  )
    cover = json.mangaPicimageUrl;
  if (cover === undefined || cover === '') cover = json.shareIcon;

  // parse tag
  const tags: Entity.Tag[] = [];
  if (json.mangaTheme.length > 0) {
    tags.push({ key: '', value: json.mangaTheme.split(' ') });
  }

  // parse metadata
  const metadata: Entity.MetadataDetail = {
    title: json.mangaName,
    authors: json.mangaAuthors,
    status: parseStatus(json.mangaIsOver),
    description: json.mangaIntro,
    tags,
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
    id: json.mangaId.toString(),
    cover: cover,
    updateTime: parseUpdateTime(json.mangaNewestTime),
    metadata: metadata,
    collections: collections,
  };

  return detail;
}

function parseChapterContent(json: any): string[] {
  const host = json.hostList[0];
  const query = json.query;
  return json.mangaSectionImages.map((it: any) => `${host}${it}${query}`);
}

export default {
  parseMangaOutlines,
  parseMangaDetail,
  parseChapterContent,
};
