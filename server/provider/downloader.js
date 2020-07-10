import fs from 'fs';
import path from 'path';

import { libraryDir } from '../config.js';
import { AsyncTaskCancelError } from '../error.js';
import { getSource } from './sources.js';

import DownloadTask from '../model/download_task.js';
import DownloadChapterTask from '../model/download_chapter_task.js';

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
    console.log(`Download: ${currentDownloadManga}`);
    await task.update({ status: DownloadTask.Status.DOWNLOADING });
    cancelIfNeed();

    const mangaDir = path.join(libraryDir, task.targetManga);
    if (!fs.existsSync(mangaDir)) fs.mkdirSync(mangaDir);

    const source = getSource(task.source);
    const detail = await source.requestMangaDetail(task.sourceManga);
    cancelIfNeed();

    await downloadMetadata(mangaDir, detail, task);
    await downloadContent(mangaDir, detail, task);

    if (!task.isCreatedBySubscription) {
      await DownloadChapterTask.Model.destroy({ where: { targetManga: task.targetManga } });
    }
    await task.destroy();
  } catch (e) {
    console.log(e);
    if (e instanceof AsyncTaskCancelError) {
      console.log('Download is canceled');
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
    const source = getSource(task.source);
    const stream = fs.createWriteStream(thumbPath);
    await source.requestImage(detail.thumb, stream);
    cancelIfNeed();
  }
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
        console.log(
          `ImageError manga:${chapterTask.targetManga} chapter:${chapterTask.targetChapter} image:${i}`
        );
        console.log(error);
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
