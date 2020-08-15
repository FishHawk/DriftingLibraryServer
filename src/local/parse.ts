import fs from 'fs/promises';
import path from 'path';
import { Metadata, MangaDetail, Collection, Chapter } from '../model/manga_detail';
import {
  isFileExist,
  readJSON,
  isDirectoryExist,
  listDirectoryWithNaturalOrder,
  listImageFileWithNaturalOrder,
} from './fs_util';
import { validateMangaId, validateCollectionId, validateChapterId } from './validate';

const libraryDir = '';

async function parseMangaMetadata(mangaDir: string): Promise<Metadata> {
  const filepath = path.join(mangaDir, 'metadata.json');
  return readJSON(filepath).then((json) => {
    // TODO: check json schema
    if (json === undefined) return {};
    return json;
  });
}

export async function parseMangaThumb(mangaDir: string) {
  const possibleThumbFileName = ['thumb.jpg', 'thumb.png', 'thumb.png'];
  for (const filename of possibleThumbFileName) {
    const filepath = path.join(mangaDir, filename);
    if (await isFileExist(filepath)) return filename;
  }
  // TODO: choose first image if thumb not exist
  return undefined;
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

  const subFolders = await listDirectoryWithNaturalOrder(mangaDir);
  if (subFolders.length != 0) {
    let collections = [];

    // depth 3
    for (const collectionId of subFolders) {
      const chapters = await listDirectoryWithNaturalOrder(
        path.join(mangaDir, collectionId)
      ).then((list) => list.map(parseChapterId));
      if (chapters.length > 0) {
        const collection: Collection = {
          id: collectionId,
          depth: 3,
          chapters: chapters,
        };
        collections.push(collection);
      }
    }

    // depth 2
    if (collections.length === 0) {
      const chapters = subFolders.map((x) => parseChapterId(x));
      const collection: Collection = { id: '', depth: 2, chapters: chapters };
      collections.push(collection);
    }

    return collections;
  } else {
    // depth 1
    // TODO: add preview
    const chapter: Chapter = { id: '', name: '', title: '' };
    const collection: Collection = { id: '', depth: 1, chapters: [chapter] };
    return [collection];
  }
}

export async function parseMangaDetail(id: string): Promise<MangaDetail | undefined> {
  if (validateMangaId(id)) return undefined;

  const mangaDir = path.join(libraryDir, id);
  if (!isDirectoryExist(mangaDir)) return undefined;

  return new MangaDetail(id)
    .setMetaData(await parseMangaMetadata(mangaDir))
    .setThumb(await parseMangaThumb(mangaDir))
    .setCollections(await parseMangaCollections(mangaDir))
    .setUpdateTime(await fs.stat(mangaDir).then((x) => x.mtime.getTime()));
}

export async function parseChapterContent(
  id: string,
  collectionId: string,
  chapterId: string
): Promise<string[] | undefined> {
  if (validateMangaId(id) && validateCollectionId(collectionId) && validateChapterId(chapterId))
    return undefined;

  const chapterDir = path.join(libraryDir, id, collectionId, chapterId);
  if (!(await isDirectoryExist(chapterDir))) return undefined;
  return listImageFileWithNaturalOrder(chapterDir);
}
