import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { get_detail, get_chapter } from './providers/manhuadui.js';

async function download_chapter(dir, manga_id, chapter_id) {
  const image_list = await get_chapter(manga_id, chapter_id);

  for (const [i, url] of image_list.entries()) {
    await axios({
      method: 'get',
      url: url,
      responseType: 'stream',
    }).then(function (response) {
      response.data.pipe(fs.createWriteStream(`${dir}/${i}.jpg`));
    });
  }
}

async function download_manga(dir, manga_id) {
  const detail = await get_detail(manga_id);
  const mangaDir = path.join(dir, detail.title);
  if (!fs.existsSync(mangaDir)) fs.mkdirSync(mangaDir);

  for (const [title, collection] of Object.entries(detail.collections)) {
    const collectionDir = path.join(mangaDir, title);
    if (!fs.existsSync(collectionDir)) fs.mkdirSync(collectionDir);

    for (const chapter of collection) {
      const chapterDir = path.join(collectionDir, chapter.title);
      if (!fs.existsSync(chapterDir)) {
        fs.mkdirSync(chapterDir);
        await download_chapter(chapterDir, detail.id, chapter.id);
      }
    }
  }
}

export { download_chapter, download_manga };
