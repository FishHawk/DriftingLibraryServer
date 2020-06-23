import fs from 'fs';
import path from 'path';

import config from '../config.js';
import { OrderMode } from '../model/order.js';

async function download(source, sourceMangaId, targetMangaId, mode) {
  // TODO: filter illegal char
  const detail = await source.requestMangaDetail(sourceMangaId);

  const mangaDir = path.join(config.libraryDir, targetMangaId);
  if (!fs.existsSync(mangaDir)) fs.mkdirSync(mangaDir);
  else if (mode === OrderMode.PASS_IF_MANGA_EXIST) return;

  const metadataPath = path.join(mangaDir, 'metadata.json');
  if (!fs.existsSync(metadataPath) || mode === OrderMode.FORCE) {
    const metadata = {
      title: detail.title,
      author: detail.author,
      status: detail.status,
      description: detail.description,
      keys: detail.keys,
    };
    fs.writeFileSync(metadataPath, JSON.stringify(metadata));
  }

  const thumbPath = path.join(mangaDir, 'thumb.jpg');
  if (!fs.existsSync(thumbPath) || mode === OrderMode.FORCE) {
    // TODO: if extension is not jpg ?
    const stream = fs.createWriteStream(thumbPath);
    await source.requestImage(detail.thumb, stream);
  }

  for (const collection of detail.collections) {
    const collectionDir = path.join(mangaDir, collection.title);
    if (!fs.existsSync(collectionDir)) fs.mkdirSync(collectionDir);
    else if (collection.title !== '' && mode === OrderMode.PASS_IF_COLLECTION_EXIST) continue;

    for (const chapter of collection.chapters) {
      const chapterDir = path.join(collectionDir, chapter.name);
      if (!fs.existsSync(chapterDir)) fs.mkdirSync(chapterDir);
      else if (chapter.name !== '' && mode === OrderMode.PASS_IF_CHAPTER_EXIST) continue;

      const imageUrls = await source.requestChapterContent(chapter.id);

      for (const [i, url] of imageUrls.entries()) {
        // TODO: if extension is not jpg ?
        const imagePath = path.join(chapterDir, `${i}.jpg`);
        if (!fs.existsSync(imagePath) || mode === OrderMode.FORCE) {
          const stream = fs.createWriteStream(imagePath);
          await source.requestImage(url, stream);
        }
      }
    }
  }
}

export default download;
