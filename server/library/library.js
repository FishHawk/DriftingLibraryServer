import fs from 'fs';
import path from 'path';

import { libraryDir } from '../config.js';
import { MangaOutline, Chapter, MangaDetail } from '../model/manga.js';
import { Filter } from './filter.js';
import { validateFilename } from './validate_filename.js';

export { libraryDir };

// util function

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

function isMangaIdValid(id) {
  return validateFilename(id);
}

function removeManga(id) {
  const mangaDir = path.join(libraryDir, id);
  fs.rmdirSync(mangaDir, { recursive: true });
}

function searchLibrary(lastTime, limit, keywords) {
  const mangaList = fs
    .readdirSync(libraryDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map(function (dirent) {
      const fileName = dirent.name;
      return {
        id: fileName,
        time: fs.statSync(libraryDir + '/' + fileName).mtime.getTime(),
      };
    })
    .filter((v) => (lastTime === undefined ? true : v.time < lastTime))
    .sort((a, b) => b.time - a.time);

  const filter = new Filter(keywords);
  const result = [];
  for (let i = 0; i < mangaList.length; ++i) {
    const x = mangaList[i];
    const metadata = parseMangaMetadataForSearch(x.id);
    if (filter.check(metadata.title, metadata.tags)) {
      const outline = new MangaOutline({
        id: x.id,
        title: metadata.title,
        thumb: parseMangaThumb(x.id),
        update: x.time,
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

function parseChapter(id) {
  const sep = ' ';
  const sepPosition = id.indexOf(sep);
  const name = sepPosition < 0 ? id : id.substr(0, sepPosition);
  const title = sepPosition < 0 ? '' : id.substr(sepPosition + 1);
  return new Chapter({ id: id, name: name, title: title });
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
          chapters: getDirNaturalOrder(`${libraryDir}/${id}/${folder}`).map((x) => parseChapter(x)),
        });
      }
      return collections;
    } else {
      const chapters = folderLevel1.map((x) => parseChapter(x));
      return [{ title: '', chapters }];
    }
  } else {
    const chapters = [new Chapter({ id: '', name: 'default', title: '' })];
    return [{ title: '', chapters }];
  }
}

export {
  isMangaExist,
  isMangaIdValid,
  createManga,
  removeManga,
  searchLibrary,
  parseMangaDetail,
  parseChapterContent,
};
