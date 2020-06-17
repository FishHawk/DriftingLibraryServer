import fs from 'fs';
import path from 'path';
import axios from 'axios';

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

async function downloadManga(source, libraryDir, mangaId) {
  const detail = await source.getDetail(mangaId);
  const mangaDir = path.join(libraryDir, detail.title);
  if (!fs.existsSync(mangaDir)) fs.mkdirSync(mangaDir);

  for (const [title, collection] of Object.entries(detail.collections)) {
    const collectionDir = path.join(mangaDir, title);
    if (!fs.existsSync(collectionDir)) fs.mkdirSync(collectionDir);

    for (const chapter of collection) {
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
