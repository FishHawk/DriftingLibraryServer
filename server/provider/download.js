import fs from 'fs';
import events from 'events';
import path from 'path';

import config from '../config.js';
import { DownloadTaskStatus } from '../model/download_task.js';
import factory from './sources.js';

async function download(source, sourceMangaId, targetMangaId, mode) {
  // TODO: filter illegal char
  const detail = await source.requestMangaDetail(sourceMangaId);

  const mangaDir = path.join(config.libraryDir, targetMangaId);
  if (!fs.existsSync(mangaDir)) fs.mkdirSync(mangaDir);
  else if (mode === DownloadTaskMode.PASS_IF_MANGA_EXIST) return;

  const metadataPath = path.join(mangaDir, 'metadata.json');
  if (!fs.existsSync(metadataPath) || mode === DownloadTaskMode.FORCE) {
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
  if (!fs.existsSync(thumbPath) || mode === DownloadTaskMode.FORCE) {
    // TODO: if extension is not jpg ?
    const stream = fs.createWriteStream(thumbPath);
    await source.requestImage(detail.thumb, stream);
  }

  for (const collection of detail.collections) {
    const collectionDir = path.join(mangaDir, collection.title);
    if (!fs.existsSync(collectionDir)) fs.mkdirSync(collectionDir);
    else if (collection.title !== '' && mode === DownloadTaskMode.PASS_IF_COLLECTION_EXIST)
      continue;

    for (const chapter of collection.chapters) {
      const chapterDir = path.join(collectionDir, chapter.name);
      if (!fs.existsSync(chapterDir)) fs.mkdirSync(chapterDir);
      else if (chapter.name !== '' && mode === DownloadTaskMode.PASS_IF_CHAPTER_EXIST) continue;

      const imageUrls = await source.requestChapterContent(chapter.id);

      for (const [i, url] of imageUrls.entries()) {
        // TODO: if extension is not jpg ?
        const imagePath = path.join(chapterDir, `${i}.jpg`);
        if (!fs.existsSync(imagePath) || mode === DownloadTaskMode.FORCE) {
          const stream = fs.createWriteStream(imagePath);
          await source.requestImage(url, stream);
        }
      }
    }
  }
}

class DownloadTaskQueue {
  #isRunning;
  #queue = [];
  #emitter = new events.EventEmitter();

  constructor() {
    this.#emitter.on('run', async () => {
      if (this.#isRunning) return;
      this.#isRunning = true;
      await this.run();
      this.#isRunning = false;
    });
  }

  add(order) {
    order.status = DownloadTaskStatus.WAITING;
    order.errorMessage = '';
    order.save();
    this.#queue.push(order);
    this.#emitter.emit('run');
  }

  async run() {
    while (this.#queue.length > 0) {
      const order = this.#queue.shift();
      order.status = DownloadTaskStatus.PROCESSING;
      try {
        const source = factory.getSource(order.source);
        await download(source, order.sourceMangaId, order.targetMangaId, order.mode);
        order.status = DownloadTaskStatus.COMPLETED;
        order.save();
        console.log('success');
      } catch (error) {
        console.log(error);
        order.status = DownloadTaskStatus.ERROR;
        order.errorMessage = error.message;
        order.save();
      }
    }
  }
}

const downloadJobQueue = new DownloadTaskQueue();

export default downloadJobQueue;
