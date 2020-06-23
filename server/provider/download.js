import fs from 'fs';
import path from 'path';
import axios from 'axios';
import config from '../config.js';

async function downloadChapter(source, chapterDir, chapterId) {
  const imageUrls = await source.requestChapterContent(chapterId);

  for (const [i, url] of imageUrls.entries()) {
    const extension = url.split('.').pop();
    const imagePath = path.join(chapterDir, `${i}.${extension}`);
    if (!fs.existsSync(imagePath)) {
      const stream = fs.createWriteStream(`${chapterDir}/${i}.jpg`)
      await source.requestImage(url, stream);
    }
  }
}

async function downloadManga(source, sourceMangaId, targetMangaId = null) {
  const detail = await source.requestMangaDetail(sourceMangaId);
  if (targetMangaId == null) targetMangaId = detail.title;

  const mangaDir = path.join(config.libraryDir, targetMangaId);
  if (!fs.existsSync(mangaDir)) fs.mkdirSync(mangaDir);

  for (const collection of detail.collections) {
    const collectionDir = path.join(mangaDir, collection.title);
    if (!fs.existsSync(collectionDir)) fs.mkdirSync(collectionDir);

    for (const chapter of collection.chapters) {
      const chapterDir = path.join(collectionDir, chapter.name);
      console.log(chapterDir);
      if (!fs.existsSync(chapterDir)) fs.mkdirSync(chapterDir);
      await downloadChapter(source, chapterDir, chapter.id);
    }
  }
}

export default {
  downloadManga,
};
