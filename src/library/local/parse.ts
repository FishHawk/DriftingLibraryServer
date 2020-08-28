import fs from 'fs/promises';
import path from 'path';

import { MetadataOutline, MangaOutline } from '../../entity/manga_outline';
import { MetadataDetail, MangaDetail, Collection, Chapter } from '../../entity/manga_detail';
import * as fsu from '../../util/fs';


async function parseMangaThumb(mangaDir: string) {
  const possibleThumbFileName = ['thumb.jpg', 'thumb.png', 'thumb.png'];
  for (const filename of possibleThumbFileName) {
    const filepath = path.join(mangaDir, filename);
    if (await fsu.isFileExist(filepath)) return filename;
  }
  // TODO: choose first image if thumb not exist
  return undefined;
}

async function parseMangaUpdateTime(mangaDir: string) {
  return fs.stat(mangaDir).then((x) => x.mtime.getTime());
}

async function parseMangaMetadataOutline(mangaDir: string): Promise<MetadataOutline> {
  const filepath = path.join(mangaDir, 'metadata.json');
  return fsu.readJSON(filepath).then((json) => {
    // TODO: check json schema
    if (json === undefined) return {};
    return json;
  });
}

async function parseMangaMetadataDetail(mangaDir: string): Promise<MetadataDetail> {
  const filepath = path.join(mangaDir, 'metadata.json');
  return fsu.readJSON(filepath).then((json) => {
    // TODO: check json schema
    if (json === undefined) return {};
    return json;
  });
}

async function parseMangaCollections(mangaDir: string): Promise<Collection[]> {
  const parseChapterId = (id: string): Chapter => {
    const sep = ' ';
    const sepPosition = id.indexOf(sep);
    const chapter: Chapter = {
      id: id,
      name: sepPosition < 0 ? id : id.substr(0, sepPosition),
      title: sepPosition < 0 ? '' : id.substr(sepPosition + 1),
    };
    return chapter;
  };

  const subFolders = await fsu.listDirectoryWithNaturalOrder(mangaDir);
  if (subFolders.length != 0) {
    let collections = [];

    // depth 3
    for (const collectionId of subFolders) {
      const chapters = await fsu
        .listDirectoryWithNaturalOrder(path.join(mangaDir, collectionId))
        .then((list) => list.map(parseChapterId));
      if (chapters.length > 0) {
        const collection: Collection = { id: collectionId, chapters: chapters };
        collections.push(collection);
      }
    }

    // depth 2
    if (collections.length === 0) {
      const chapters = subFolders.map((x) => parseChapterId(x));
      const collection: Collection = { id: '', chapters: chapters };
      collections.push(collection);
    }

    return collections;
  } else {
    // depth 1
    // TODO: add preview
    const chapter: Chapter = { id: '', name: '', title: '' };
    const collection: Collection = { id: '', chapters: [chapter] };
    return [collection];
  }
}

export async function parseMangaOutline(
  libraryDir: string,
  mangaId: string
): Promise<MangaOutline> {
  const mangaDir = path.join(libraryDir, mangaId);
  const mangaOutline: MangaOutline = {
    id: mangaId,
    thumb: await parseMangaThumb(mangaDir),
    updateTime: await parseMangaUpdateTime(mangaDir),
    metadata: await parseMangaMetadataOutline(mangaDir),
  };
  return mangaOutline;
}

export async function parseMangaDetail(libraryDir: string, mangaId: string): Promise<MangaDetail> {
  const mangaDir = path.join(libraryDir, mangaId);
  const mangaDetail: MangaDetail = {
    id: mangaId,
    thumb: await parseMangaThumb(mangaDir),
    updateTime: await parseMangaUpdateTime(mangaDir),
    metadata: await parseMangaMetadataDetail(mangaDir),
    collections: await parseMangaCollections(mangaDir),
  };
  return mangaDetail;
}
