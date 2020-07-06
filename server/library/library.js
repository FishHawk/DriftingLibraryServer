import fs from 'fs';
import path from 'path';

import { libraryDir } from '../config.js';
import { MangaOutline, Chapter, MangaDetail } from '../model/manga.js';
import { Filter } from './filter.js';

export { libraryDir };

// util function
const getDir = (path) =>
  fs
    .readdirSync(path, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
    .sort();

const getDirNaturalOrder = (path) =>
  fs
    .readdirSync(path, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
    .sort(naturalCompare);

const getFileNaturalOrder = (path) =>
  fs
    .readdirSync(path, { withFileTypes: true })
    .filter((dirent) => dirent.isFile())
    .map((dirent) => dirent.name)
    .sort(naturalCompare);

function naturalCompare(a, b) {
  var ax = [],
    bx = [];

  a.replace(/(\d+)|(\D+)/g, function (_, $1, $2) {
    ax.push([$1 || Infinity, $2 || '']);
  });
  b.replace(/(\d+)|(\D+)/g, function (_, $1, $2) {
    bx.push([$1 || Infinity, $2 || '']);
  });

  while (ax.length && bx.length) {
    var an = ax.shift();
    var bn = bx.shift();
    var nn = an[0] - bn[0] || an[1].localeCompare(bn[1]);
    if (nn) return nn;
  }

  return ax.length - bx.length;
}

// api
function createManga(id) {
  const mangaDir = path.join(libraryDir, id);
  if (!fs.existsSync(mangaDir)) fs.mkdirSync(mangaDir);
}

function isMangaExist(id) {
  const mangaDir = path.join(libraryDir, id);
  return fs.existsSync(mangaDir);
}

function searchLibrary(lastId, limit, keywords) {
  const mangaIdList = getDir(libraryDir);
  const start = lastId ? mangaIdList.findIndex((id) => id > lastId) : 0;
  if (start === -1) return [];

  const filter = new Filter(keywords);
  const result = [];
  for (let i = start; i < mangaIdList.length; ++i) {
    const id = mangaIdList[i];
    const metadata = parseMangaMetadataForSearch(id);
    if (filter.check(metadata.title, metadata.tags)) {
      const outline = new MangaOutline({
        id,
        title: metadata.title,
        thumb: parseMangaThumb(id),
      });
      result.push(outline);
      if (result.length >= limit) break;
    }
  }
  return result;
}

function parseMangaDetail(id) {
  if (!isMangaExist(id)) return null;
  const metadata = parseMangaMetadata(id);
  const thumb = parseMangaThumb(id);
  const collections = parseMangaContent(id);
  const detail = new MangaDetail({
    id,
    title: metadata.title,
    thumb: thumb,
    author: metadata.author,
    status: metadata.status,
    update: metadata.update,
    description: metadata.description,
    tags: metadata.tags,
    collections,
  });
  return detail;
}

function parseChapterContent(id, collectionTitle, chapterTitle) {
  const dir = `${libraryDir}/${id}/${collectionTitle}/${chapterTitle}`;
  const allowedFileExtension = ['.jpg', '.jpeg', '.png'];
  if (!fs.existsSync(dir)) return undefined;
  return getFileNaturalOrder(dir).filter(function (file) {
    return (
      allowedFileExtension.includes(path.extname(file).toLowerCase()) &&
      file.substr(0, file.lastIndexOf('.')) != 'thumb'
    );
  });
}

function parseMangaMetadataForSearch(id) {
  const filepath = path.join(libraryDir, id, 'metadata.json');

  const metadata = fs.existsSync(filepath) ? JSON.parse(fs.readFileSync(filepath, 'utf8')) : {};
  if (metadata.title === undefined) metadata.title = id;
  if (metadata.tags === undefined) metadata.tags = [];

  return {
    title: metadata.title,
    tags: metadata.tags,
  };
}

function parseMangaMetadata(id) {
  const filepath = path.join(libraryDir, id, 'metadata.json');
  const metadata = fs.existsSync(filepath) ? JSON.parse(fs.readFileSync(filepath, 'utf8')) : {};
  if (metadata.title === undefined) metadata.title = id;
  return metadata;
}

function parseMangaThumb(id) {
  for (const filename of ['thumb.jpg', 'thumb.png', 'thumb.png']) {
    const filepath = path.join(libraryDir, id, filename);
    if (fs.existsSync(filepath)) return filename;
  }
  return '';
}

function parseMangaContent(id) {
  const folderLevel1 = getDirNaturalOrder(`${libraryDir}/${id}`);
  if (folderLevel1.length != 0) {
    let isLevel3 = false;
    for (let folder of folderLevel1) {
      if (getDirNaturalOrder(`${libraryDir}/${id}/${folder}`).length > 0) {
        isLevel3 = true;
      }
    }

    if (isLevel3) {
      let collections = [];
      for (let folder of folderLevel1) {
        collections.push({
          title: folder,
          chapters: getDirNaturalOrder(`${libraryDir}/${id}/${folder}`).map(
            (x) => new Chapter({ id: x, name: x, title: x })
          ),
        });
      }
      return collections;
    } else {
      const chapters = folderLevel1.map((x) => new Chapter({ id: x, name: x, title: x }));
      return [{ title: '', chapters }];
    }
  } else {
    const chapters = [new Chapter({ id: '', name: '', title: '' })];
    return [{ title: '', chapters }];
  }
}

export { isMangaExist, createManga, searchLibrary, parseMangaDetail, parseChapterContent };