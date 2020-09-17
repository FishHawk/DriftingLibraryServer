import fs from 'fs/promises';
import path from 'path';

import { readJSON } from '../util/fs';
import { Filter, MatchEntry } from './filter';
import { MangaAccessor } from './accessor.manga';

async function listLibraryWithMtime(libraryDir: string) {
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

async function buildMatchEntry(libraryDir: string, id: string): Promise<MatchEntry> {
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

export async function searchLibrary(
  libraryDir: string,
  lastTime: number | undefined,
  limit: number,
  keywords: string
) {
  const mangaList = await listLibraryWithMtime(libraryDir).then((list) => {
    return list
      .filter((v) => (lastTime === undefined ? true : v.time < lastTime))
      .sort((a, b) => b.time - a.time)
      .map((v) => v.id);
  });

  const filter = new Filter(keywords);
  const result = [];

  for (let i = 0; i < mangaList.length; ++i) {
    const mangaId = mangaList[i];
    const entry = await buildMatchEntry(libraryDir, mangaId);

    if (filter.check(entry)) {
      const accessor = new MangaAccessor(libraryDir, mangaId);
      const outline = await accessor.getOutline();
      result.push(outline);
      if (result.length >= limit) break;
    }
  }
  return result;
}
