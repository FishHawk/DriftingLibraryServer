import fs from 'fs/promises';
import path from 'path';
import { Filter, MatchEntry } from './filter';
import { readJSON } from './fs_util';
import { parseMangaThumb } from './parse';
import { MangaOutline } from '../model/manga_outline';

const libraryDir = '';

async function listLibraryWithMtime() {
  return fs.readdir(libraryDir, { withFileTypes: true }).then((list) => {
    return Promise.all(
      list
        .filter((dirent) => dirent.isDirectory())
        .map(async function (dirent) {
          const fileName = dirent.name;
          const stat = await fs.stat(path.join(libraryDir, fileName));
          return {
            id: fileName,
            time: stat.mtime.getTime(),
          };
        })
    );
  });
}

async function buildMatchEntry(id: string): Promise<MatchEntry> {
  const filepath = path.join(libraryDir, id, 'metadata.json');

  return readJSON(filepath).then((json) => {
    let entry: MatchEntry = {
      title: id,
      tags: [],
    };
    if (json === undefined) return entry;
    if (json.title !== undefined) entry.title = json.title;
    if (json.authors !== undefined) entry.authors = json.authors;
    if (json.tags !== undefined) entry.tags = json.tags;
    return entry;
  });
}

export async function searchLibrary(lastTime: number, limit: number, keywords: string) {
  const mangaList = await listLibraryWithMtime().then((list) => {
    return list
      .filter((v) => (lastTime === undefined ? true : v.time < lastTime))
      .sort((a, b) => b.time - a.time);
  });

  const filter = new Filter(keywords);
  const result = [];
  for (let i = 0; i < mangaList.length; ++i) {
    const x = mangaList[i];
    const entry = await buildMatchEntry(x.id);
    if (filter.check(entry)) {
      const outline: MangaOutline = {
        id: x.id,
        title: entry.title,
        thumb: await parseMangaThumb(x.id),
        lastUpdate: x.time,
      };
      result.push(outline);
      if (result.length >= limit) break;
    }
  }
  return result;
}
