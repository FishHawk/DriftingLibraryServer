import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { libraryDir } from '../config.js';

async function downloadChapter(source, chapterDir, mangaId, chapterId) {
  const imageUrls = await source.getChapter(mangaId, chapterId);

  for (const [i, url] of imageUrls.entries()) {
    const extension = url.split('.').pop();
    const imagePath = path.join(chapterDir, `${i}.${extension}`);
    if (!fs.existsSync(imagePath)) {
      await axios({
        method: 'get',
        url: url,
        responseType: 'stream',
      })
        .then(function (response) {
          response.data.pipe(fs.createWriteStream(`${chapterDir}/${i}.jpg`));
        })
        .catch(function (error) {
          console.log(error);
          return;
        });
    }
  }
}

async function downloadManga(source, sourceMangaId, targetMangaId = null) {
  const detail = await source.getDetail(sourceMangaId);
  if (targetMangaId == null) targetMangaId = detail.title;

  const mangaDir = path.join(libraryDir, targetMangaId);
  if (!fs.existsSync(mangaDir)) fs.mkdirSync(mangaDir);

  for (const collection of detail.collections) {
    const collectionDir = path.join(mangaDir, collection.title);
    if (!fs.existsSync(collectionDir)) fs.mkdirSync(collectionDir);

    for (const chapter of collection.chapters) {
      const chapterDir = path.join(collectionDir, chapter.title);
      console.log(chapterDir);
      if (!fs.existsSync(chapterDir)) fs.mkdirSync(chapterDir);
      await downloadChapter(source, chapterDir, detail.id, chapter.id);
    }
  }
}

export default {
  downloadManga,
};
