import moment from 'moment';
import decompress from 'decompress';

import * as Entity from '../../../library/entity';

function generateHashKey(mangaId: string, chapterId: string) {
  const m = Number.parseInt(mangaId);
  const c = Number.parseInt(chapterId);
  const n: number[] = [];
  for (var i = 0; i < 4; i++) n.push((c >> (8 * i)) % 256);
  for (var i = 0; i < 4; i++) n.push((m >> (8 * i)) % 256);
  return n;
}

function parseMangaStatus(json: any): Entity.Status {
  if (json === 0) return Entity.Status.Ongoing;
  else if (json === 1) return Entity.Status.Completed;
  else return Entity.Status.Unknown;
}

function parseSearchResponse(res: any): Entity.MangaOutline[] {
  return res.data.data.list.map((it: any) => {
    const metadata: Entity.MetadataOutline = {
      title: it.org_title,
      authors: it.author_name,
      status: parseMangaStatus(it.is_finish),
    };
    const outline: Entity.MangaOutline = {
      id: it.id,
      thumb: it.vertical_cover,
      updateTime: undefined,
      metadata,
    };
    return outline;
  });
}

function parsePopularResponse(res: any): Entity.MangaOutline[] {
  return res.data.data.map((it: any) => {
    const metadata: Entity.MetadataOutline = {
      title: it.title,
      authors: it.author,
      status: parseMangaStatus(it.is_finish),
    };
    const outline: Entity.MangaOutline = {
      id: it.comic_id,
      thumb: it.vertical_cover,
      metadata,
    };
    return outline;
  });
}

function parseLatestResponse(res: any): Entity.MangaOutline[] {
  return res.data.data.list.map((it: any) => {
    const metadata: Entity.MetadataOutline = {
      title: it.title,
    };
    const outline: Entity.MangaOutline = {
      id: it.comic_id,
      thumb: it.vertical_cover,
      metadata,
    };
    return outline;
  });
}

function parseCategoryResponse(res: any): Entity.MangaOutline[] {
  return res.data.data.map((it: any) => {
    const metadata: Entity.MetadataOutline = {
      title: it.title,
      status: parseMangaStatus(it.is_finish),
    };
    const outline: Entity.MangaOutline = {
      id: it.season_id,
      thumb: it.vertical_cover,
      metadata,
    };
    return outline;
  });
}

function parseMangaDetail(json: any): Entity.MangaDetail {
  // parse metadata
  const tags: Entity.Tag[] = [];
  if (json.styles.length > 0) {
    tags.push({ key: '', value: json.styles });
  }

  const metadata: Entity.MetadataDetail = {
    title: json.title,
    authors: json.author_name,
    status: parseMangaStatus(json.is_finish),
    description: json.evaluate,
    tags,
  };

  // parse collections
  const collection = {
    id: '',
    chapters: json.ep_list
      .map((it: any) => {
        const prefix = it.is_locked ? '[X] ' : '';
        const chapter: Entity.Chapter = {
          id: it.id,
          name: prefix + it.short_title,
          title: prefix + it.title,
        };
        return chapter;
      })
      .reverse(),
  };

  // parse detail
  const detail: Entity.MangaDetail = {
    id: json.id,
    thumb: json.vertical_cover,
    updateTime: moment(json.release_time, 'YYYY年MM月DD日').valueOf(),
    metadata,
    collections: [collection],
  };

  return detail;
}

async function parseChapterContent(
  mangaId: string,
  chapterId: string,
  ciphertext: string
): Promise<any> {
  const key = generateHashKey(mangaId, chapterId);
  const buffer = Buffer.from(ciphertext).slice(9);
  for (let i = 0; i < ciphertext.length; i++) {
    buffer[i] ^= key[i % 8];
  }

  return decompress(buffer).then((files) => {
    return JSON.parse(files[0].data.toString());
  });
}

export default {
  parseSearchResponse,
  parsePopularResponse,
  parseLatestResponse,
  parseCategoryResponse,
  parseMangaDetail,
  parseChapterContent,
};
