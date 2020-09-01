import * as Entity from '../../../library/entity';

function parseMangaStatus(json: any): Entity.Status {
  if (json === '已完结') return Entity.Status.Completed;
  else if (json === '连载中') return Entity.Status.Ongoing;
  else return Entity.Status.Unknown;
}

export function parseMangaOutlines(json: any): Entity.MangaOutline[] {
  return json.map((x: any) => {
    const metadata: Entity.MetadataOutline = {
      title: x.title,
      authors: x.authors.split('/'),
      status: parseMangaStatus(x.status),
    };
    const outline: Entity.MangaOutline = {
      id: x.id,
      thumb: x.cover,
      updateTime: x.last_updatetime,
      metadata: metadata,
    };
    return outline;
  });
}

export function parseMangaDetail(json: any): Entity.MangaDetail {
  // parse metadata
  const authors = json.authors.map((x: any) => x.tag_name);
  const status = parseMangaStatus(json.status[0].tag_name);

  const types = json.types.map((x: any) => x.tag_name);
  const tag: Entity.Tag = { key: 'type', value: types };

  const metadata: Entity.MetadataDetail = {
    title: json.title,
    authors,
    status,
    description: json.description,
    tags: [tag],
  };

  // parse collections
  const collections: Entity.Collection[] = json.chapters.map((x: any) => {
    const chapters = x.data
      .map((x: any) => {
        const chapter: Entity.Chapter = {
          id: x.chapter_id,
          name: x.chapter_title,
          title: x.chapter_title,
        };
        return chapter;
      })
      .reverse();
    const collection: Entity.Collection = {
      id: x.title,
      chapters,
    };
    return collection;
  });

  const detail: Entity.MangaDetail = {
    id: json.id,
    thumb: json.cover,
    updateTime: json.last_updatetime,
    metadata: metadata,
    collections,
  };
  return detail;
}

export function parseChapterContent(json: any): string[] {
  return json.page_url;
}
