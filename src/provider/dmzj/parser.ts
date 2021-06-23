import * as Model from '@data';

function parseMangaStatus(json: any): Model.MangaStatus {
  if (json === '已完结') return Model.MangaStatus.Completed;
  else if (json === '连载中') return Model.MangaStatus.Ongoing;
  else return Model.MangaStatus.Unknown;
}

function parseMangaOutlines(json: any): Model.MangaOutline[] {
  return json.map((it: any) => {
    const metadata: Model.MetadataOutline = {
      title: it.title,
      authors: it.authors.split('/'),
      status: parseMangaStatus(it.status),
    };
    const outline: Model.MangaOutline = {
      id: it.id || it.comic_id,
      cover: it.cover,
      updateTime: it.last_updatetime * 1000,
      metadata: metadata,
    };
    return outline;
  });
}

function parseMangaDetail(json: any): Model.MangaDetail {
  // parse metadata
  const authors = json.authors.map((it: any) => it.tag_name);
  const status = parseMangaStatus(json.status[0].tag_name);

  const tags: Model.Tag[] = [];
  if (json.types.length > 0) {
    tags.push({ key: '', value: json.types.map((it: any) => it.tag_name) });
  }

  const metadata: Model.MetadataDetail = {
    title: json.title,
    authors,
    status,
    description: json.description,
    tags,
  };

  // parse collections
  const collections: Model.Collection[] = json.chapters.map((it: any) => {
    const chapters = it.data
      .map((it: any) => {
        const chapter: Model.Chapter = {
          id: it.chapter_id,
          name: it.chapter_title,
          title: '',
        };
        return chapter;
      })
      .reverse();
    const collection: Model.Collection = {
      id: it.title,
      chapters,
    };
    return collection;
  });

  const detail: Model.MangaDetail = {
    id: json.id,
    cover: json.cover,
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
