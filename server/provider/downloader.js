import fs from 'fs';
import path from 'path';

import { logger } from '../logger.js';
import { libraryDir } from '../config.js';

import DownloadTask from '../model/download_task.js';
import DownloadChapterTask from '../model/download_chapter_task.js';

import { getSource } from './sources.js';

class AsyncTaskCancelError extends Error {
  constructor() {
    super();
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = 'Async task is cancelled.';
  }
}

let isRunning = false;
let isCancelled = false;
let currentDownloadManga = null;

function startDownloader() {
  if (isRunning) return;
  isRunning = true;
  downloadLoop().then(() => (isRunning = false));
}

function cancelCurrentDownload() {
  isCancelled = true;
}

function isMangaDownloading(manga) {
  return manga === currentDownloadManga;
}

function cancelIfNeed() {
  if (isCancelled) throw new AsyncTaskCancelError();
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
    logger.info(`Download: ` + `${task.source}/${task.sourceManga} -> ` + `${task.targetManga}`);
    currentDownloadManga = task.targetManga;
    await task.update({ status: DownloadTask.Status.DOWNLOADING });
    cancelIfNeed();

    const mangaDir = path.join(libraryDir, task.targetManga);
    if (!fs.existsSync(mangaDir)) fs.mkdirSync(mangaDir);

    const source = getSource(task.source);
    const detail = await source.requestMangaDetail(task.sourceManga);
    cancelIfNeed();

    await downloadMetadata(mangaDir, detail, task);
    await downloadContent(mangaDir, detail, task);

    const isCompleted = DownloadChapterTask.Model.count({
      where: {
        targetManga: task.targetManga,
        isCompleted: false,
      },
    }).then((count) => {
      if (count != 0) return false;
      return true;
    });

    if (isCompleted) {
      if (!task.isCreatedBySubscription) {
        await DownloadChapterTask.Model.destroy({
          where: { targetManga: task.targetManga },
        });
      }
      await task.destroy();
    } else {
      await task.update({ status: DownloadTask.Status.ERROR });
    }
  } catch (error) {
    if (error instanceof AsyncTaskCancelError) {
      logger.info(`Download is canceled`);
    } else {
      logger.error(`Download error: ${error.stack}`);
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
    const source = getSource(task.source);
    const stream = fs.createWriteStream(thumbPath);
    await source.requestImage(detail.thumb, stream);
    cancelIfNeed();
  }
}

function refreshModifiedTime(mangaDir) {
  const tempPath = path.join(mangaDir, 'temp.json');
  fs.closeSync(fs.openSync(tempPath, 'w'));
  fs.unlinkSync(tempPath);
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
          targetChapter: `${chapter.name} ${chapter.title}`,
        },
      });
      cancelIfNeed();
      if (!chapterTask.isCompleted) {
        try {
          await downloadChapter(chapterTask);
          refreshModifiedTime(mangaDir);
        } catch (error) {}
        cancelIfNeed();
      }
    }
  }
}

async function downloadChapter(chapterTask) {
  logger.info(
    `Download chapter: ` +
      `manga:${chapterTask.targetManga} ` +
      `chapter:${chapterTask.targetChapter} `
  );
  const source = getSource(chapterTask.source);
  const imageUrls = await source.requestChapterContent(chapterTask.sourceChapter);
  cancelIfNeed();
  await chapterTask.update({ pageTotal: imageUrls.length });

  const chapterDir = path.join(
    libraryDir,
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
      try {
        const stream = fs.createWriteStream(imagePath);
        await source.requestImage(url, stream);
      } catch (error) {
        logger.error(
          `Image error at: ` +
            `manga:${chapterTask.targetManga} ` +
            `chapter:${chapterTask.targetChapter} ` +
            `image:${i} `
        );
        logger.error(`Image error: ${error.stack}`);
        fs.unlinkSync(imagePath);
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

export { startDownloader, cancelCurrentDownload, isMangaDownloading };
