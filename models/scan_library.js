const fs = require('fs');
const config = require('../config');

const libraryDir = config.libraryDir;

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

// scan library
function getMangaSummary(id) {
  let metadata = JSON.parse(
    fs.readFileSync(`${libraryDir}/${id}/metadata.json`, 'utf8')
  );

  metadata.id = id;
  if (!metadata.title) {
    metadata.title = id;
  }

  if (fs.existsSync(`${libraryDir}/${id}/thumb.jpg`)) {
    metadata.thumb = 'thumb.jpg';
  } else if (fs.existsSync(`${libraryDir}/${id}/thumb.jpeg`)) {
    metadata.thumb = 'thumb.jpeg';
  } else if (fs.existsSync(`${libraryDir}/${id}/thumb.png`)) {
    metadata.thumb = 'thumb.png';
  }

  return metadata;
}

function scanLibrary() {
  return getDir(libraryDir).map(getMangaSummary);
}

const mangaList = scanLibrary();

// models
function getMangaList(lastId, limit) {
  if (mangaList.length == 0) return [];

  let start = lastId ? mangaList.findIndex((x) => x.id > lastId) : 0;
  if (start == -1) return [];
  let end = Math.min(mangaList.length, start + limit);

  return mangaList.slice(start, end).map((x) => {
    return { id: x.id, title: x.title, thumb: x.thumb };
  });
}

function getMangaDetail(id) {
  let detail = mangaList.find((x) => x.id === id);
  if (!detail) return detail;

  const folderLevel1 = getDirNaturalOrder(`${libraryDir}/${id}`);
  if (folderLevel1.length != 0) {
    let isLevel3 = false;
    for (let folder of folderLevel1) {
      if (getDirNaturalOrder(`${libraryDir}/${id}/${folder}`).length > 0) {
        isLevel3 = true;
      }
    }

    if (isLevel3) {
      detail.collections = [];
      for (let folder of folderLevel1) {
        detail.collections.push({
          title: folder,
          chapters: getDirNaturalOrder(`${libraryDir}/${id}/${folder}`),
        });
      }
    } else {
      detail.collections = [{ title: '', chapters: folderLevel1 }];
    }
  } else {
    detail.collections = [{ title: '', chapters: [''] }];
  }
  return detail;
}

function getChapterContent(id, collectionTitle, chapterTitle) {
  const dir = `${libraryDir}/${id}/${collectionTitle}/${chapterTitle}`;
  if (!fs.existsSync(dir)) return undefined;
  return getFileNaturalOrder(dir);
}

module.exports = {
  getMangaList,
  getMangaDetail,
  getChapterContent,
};
