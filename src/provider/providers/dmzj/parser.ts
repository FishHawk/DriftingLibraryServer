import * as Entity from '../../../library/entity';

function parseMangaStatus(json: any): Entity.Status {
  if (json === '已完结') return Entity.Status.Completed;
  else if (json === '连载中') return Entity.Status.Ongoing;
  else return Entity.Status.Unknown;
}

function parseMangaOutlines(json: any): Entity.MangaOutline[] {
  return json.map((it: any) => {
    const metadata: Entity.MetadataOutline = {
      title: it.title,
      authors: it.authors.split('/'),
      status: parseMangaStatus(it.status),
    };
    const outline: Entity.MangaOutline = {
      id: it.id || it.comic_id,
      thumb: it.cover,
      updateTime: it.last_updatetime * 1000,
      metadata: metadata,
    };
    return outline;
  });
}

function parseMangaDetail(json: any): Entity.MangaDetail {
  // parse metadata
  const authors = json.authors.map((it: any) => it.tag_name);
  const status = parseMangaStatus(json.status[0].tag_name);

  const types = json.types.map((it: any) => it.tag_name);
  const tag: Entity.Tag = { key: '', value: types };

  const metadata: Entity.MetadataDetail = {
    title: json.title,
    authors,
    status,
    description: json.description,
    tags: [tag],
  };

  // parse collections
  const collections: Entity.Collection[] = json.chapters.map((it: any) => {
    const chapters = it.data
      .map((it: any) => {
        const chapter: Entity.Chapter = {
          id: it.chapter_id,
          name: it.chapter_title,
          title: it.chapter_title,
        };
        return chapter;
      })
      .reverse();
    const collection: Entity.Collection = {
      id: it.title,
      chapters,
    };
    return collection;
  });

  const detail: Entity.MangaDetail = {
    id: json.id,
    thumb: json.cover,
    updateTime: json.last_updatetime * 1000,
    metadata: metadata,
    collections,
  };
  return detail;
}

function parseChapterContent(json: any): string[] {
  return json.page_url;
}

export default {
  parseMangaOutlines,
  parseMangaDetail,
  parseChapterContent,
};
