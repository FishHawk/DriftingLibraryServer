import fs from 'fs';
import events from 'events';
import path from 'path';

import config from '../config.js';
import { DownloadTask, DownloadTaskMode, DownloadTaskStatus } from '../model/download_task.js';
import factory from './sources.js';

async function checkIsTaskProcessing(task) {
  await task.reload();
  if (task !== null && task.status === DownloadTaskStatus.PROCESSING) {
    return true;
  } else {
    return false;
  }
}

async function download(task) {
  // TODO: filter illegal char
  const source = factory.getSource(task.source);
  const sourceMangaId = task.sourceMangaId;
  const targetMangaId = task.targetMangaId;
  const mode = task.mode;

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
      if (!checkIsTaskProcessing(task)) return;

      const chapterDir = path.join(collectionDir, chapter.name);
      if (!fs.existsSync(chapterDir)) fs.mkdirSync(chapterDir);
      else if (chapter.name !== '' && mode === DownloadTaskMode.PASS_IF_CHAPTER_EXIST) continue;

      const imageUrls = await source.requestChapterContent(chapter.id);

      for (const [i, url] of imageUrls.entries()) {
        if (!checkIsTaskProcessing(task)) return;

        // TODO: if extension is not jpg ?
        const imagePath = path.join(chapterDir, `${i}.jpg`);
        if (!fs.existsSync(imagePath) || mode === DownloadTaskMode.FORCE) {
          const stream = fs.createWriteStream(imagePath);
          await source.requestImage(url, stream);
        }
      }
    }
  }

  if (!checkIsTaskProcessing(task)) return;
  task.status = DownloadTaskStatus.COMPLETED;
  await task.save();
}

class Downloader {
  #isRunning;
  #emitter = new events.EventEmitter();

  constructor() {
    this.#emitter.on('run', async () => {
      if (this.#isRunning) return;
      this.#isRunning = true;
      await this.run();
      this.#isRunning = false;
    });
  }

  start() {
    this.#emitter.emit('run');
  }

  async run() {
    while (true) {
      const task = await DownloadTask.findOne({
        where: {
          status: DownloadTaskStatus.WAITING,
        },
        order: [['updatedAt', 'DESC']],
      });

      if (task === null) break;
      task.status = DownloadTaskStatus.PROCESSING;
      await task.save();
      try {
        await download(task);
      } catch (error) {
        task.status = DownloadTaskStatus.ERROR;
        task.errorMessage = error.message;
        await task.save();
      }
    }
  }
}

const downloader = new Downloader();

export default downloader;
