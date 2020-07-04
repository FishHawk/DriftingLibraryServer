import events from 'events';
import fs from 'fs';
import path from 'path';

import config from '../config.js';
import error from '../error.js';
import DownloadTask from '../model/download_task.js';
import DownloadChapterTask from '../model/download_chapter_task.js';
import Manga from '../model/manga.js';
import factory from './sources.js';

let isRunning = false;
let isCancelled = false;
let currentDownloadManga = null;

function start() {
  if (isRunning) return;
  isRunning = true;
  downloadLoop();
  isRunning = false;
}

function cancel() {
  isCancelled = true;
}

function cancelIfMangaDownloading(manga) {
  if (manga === currentDownloadManga) isCancelled = true;
}

function cancelIfNeed() {
  if (isCancelled) throw new error.AsyncTaskCancelError();
}

async function downloadLoop() {
  while (true) {
    const task = await DownloadTask.Model.findOne({
      where: { status: DownloadTask.Status.WAITING },
      order: [['updatedAt', 'DESC']],
    });
    if (task === null) break;
    await downloadManga(task);
  }
}

async function downloadManga(task) {
  try {
    currentDownloadManga = task.targetManga;
    await task.update({ status: DownloadTask.Status.DOWNLOADING });
    cancelIfNeed();

    const mangaDir = path.join(config.libraryDir, task.targetManga);
    if (!fs.existsSync(mangaDir)) fs.mkdirSync(mangaDir);

    const source = factory.getSource(task.source);
    const detail = await source.requestMangaDetail(task.sourceManga);
    cancelIfNeed();

    await downloadMetadata(mangaDir, detail, task);
    await downloadContent(mangaDir, detail, task);

    if (!task.isCreatedBySubscription) {
      await DownloadChapterTask.Model.destroy({ where: { targetManga: task.targetManga } });
    }
    await task.destroy();
  } catch (e) {
    if (e instanceof error.AsyncTaskCancelError) {
      console.log('download task canceled')
    } else {
      await task.update({ status: DownloadTask.Status.ERROR });
    }
  } finally {
    isCancelled = false;
    currentDownloadManga = null;
  }
}

async function downloadMetadata(mangaDir, detail, task) {
  const metadataPath = path.join(mangaDir, 'metadata.json');
  if (!fs.existsSync(metadataPath)) {
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
  if (!fs.existsSync(thumbPath)) {
    const source = factory.getSource(task.source);
    const stream = fs.createWriteStream(thumbPath);
    await source.requestImage(detail.thumb, stream);
    cancelIfNeed();
  }

  await Manga.Model.update(
    {
      title: detail.title,
      thumb: 'thumb.jpg',
      author: detail.author,
      status: detail.status,
    },
    { where: { id: task.targetManga } }
  );
  cancelIfNeed();
}

async function downloadContent(mangaDir, detail, task) {
  for (const collection of detail.collections) {
    const collectionDir = path.join(mangaDir, collection.title);
    if (!fs.existsSync(collectionDir)) fs.mkdirSync(collectionDir);

    for (const chapter of collection.chapters) {
      const [chapterTask, created] = await DownloadChapterTask.Model.findOrCreate({
        where: {
          source: task.source,
          sourceChapter: chapter.id,
          targetManga: task.targetManga,
          targetCollection: collection.title,
          targetChapter: chapter.name,
        },
      });
      cancelIfNeed();
      if (!chapterTask.isCompleted) {
        await downloadChapter(chapterTask);
      }
    }
  }
}

async function downloadChapter(chapterTask) {
  const source = factory.getSource(chapterTask.source);
  const imageUrls = await source.requestChapterContent(chapterTask.sourceChapter);
  cancelIfNeed();
  await chapterTask.update({ pageTotal: imageUrls.length });

  const chapterDir = path.join(
    config.libraryDir,
    chapterTask.targetManga,
    chapterTask.targetCollection,
    chapterTask.targetChapter
  );
  if (!fs.existsSync(chapterDir)) fs.mkdirSync(chapterDir);

  let isChapterError = false;
  for (const [i, url] of imageUrls.entries()) {
    const imagePath = path.join(chapterDir, `${i}.jpg`);
    if (!fs.existsSync(imagePath)) {
      let isImageError = false;
      const stream = fs.createWriteStream(imagePath);
      source.requestImage(url, stream);
      try {
        downloadImage(stream, url);
      } catch (error) {
        isImageError = true;
      }
      cancelIfNeed();
      if (isImageError) {
        isChapterError = true;
      } else {
        await chapterTask.update({ pageDownloaded: i + 1 });
      }
    }
  }

  if (!isChapterError) await chapterTask.update({ isCompleted: true });
}

export default { start, cancel, cancelIfMangaDownloading };
