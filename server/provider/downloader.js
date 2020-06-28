import events from 'events';
import fs from 'fs';
import path from 'path';

import config from '../config.js';
import Download from '../model/download.js';
import Subscription from '../model/subscription.js';
import Manga from '../model/manga.js';
import factory from './sources.js';
import subscription from '../model/subscription.js';

let isRunning = false;
const emitter = new events.EventEmitter();
const eventStart = 'start';

emitter.on(eventStart, async () => {
  if (isRunning) return;
  isRunning = true;
  await downloadLoop();
  isRunning = false;
});

function start() {
  emitter.emit(eventStart);
}

async function downloadLoop() {
  while (true) {
    const subscription = await Subscription.Model.findOne({
      where: { status: Subscription.Status.WAITING },
      order: [['updatedAt', 'DESC']],
    });

    if (subscription === null) break;
    subscription.status = Subscription.Status.DOWNLOADING;
    await subscription.save();
    await download(subscription);
  }
}

async function download(subscription) {
  const source = factory.getSource(subscription.source);
  const sourceManga = subscription.sourceManga;
  const targetManga = subscription.targetManga;

  try {
    const detail = await source.requestMangaDetail(sourceManga);

    const mangaDir = path.join(config.libraryDir, targetManga);
    if (!fs.existsSync(mangaDir)) fs.mkdirSync(mangaDir);

    await downloadMetadata(mangaDir, detail, subscription);
    await downloadContent(mangaDir, detail, subscription);

    if ((subscription.mode = Subscription.Mode.DISPOSABLE)) {
      await Download.Model.destroy({ where: { targetManga: subscription.targetManga } });
      await subscription.destroy();
    } else {
      await subscription.update({ status: Subscription.Status.COMPLETED });
    }
  } catch (error) {
    console.log(error);
    await subscription.update({ status: Subscription.Status.ERROR });
  }
}

async function downloadMetadata(mangaDir, detail, subscription) {
  await subscription.reload();
  const source = factory.getSource(subscription.source);
  const targetManga = subscription.targetManga;

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
    const stream = fs.createWriteStream(thumbPath);
    await source.requestImage(detail.thumb, stream);
  }

  const manga = await Manga.Model.findByPk(targetManga);
  if (manga === null) {
    const a = await Manga.Model.create({
      id: targetManga,
      title: detail.title,
      thumb: 'thumb.jpg',
      author: detail.author,
      status: detail.status,
    });
  }
}

async function downloadContent(mangaDir, detail, subscription) {
  await subscription.reload();
  const targetManga = subscription.targetManga;

  for (const collection of detail.collections) {
    const collectionDir = path.join(mangaDir, collection.title);
    if (!fs.existsSync(collectionDir)) fs.mkdirSync(collectionDir);

    for (const chapter of collection.chapters) {
      let download = await Download.Model.findOne({
        where: {
          targetManga: targetManga,
          targetCollection: collection.title,
          targetChapter: chapter.name,
        },
      });
      if (download === null) {
        download = await Download.Model.create({
          source: subscription.source,
          sourceChapter: chapter.id,
          targetManga: targetManga,
          targetCollection: collection.title,
          targetChapter: chapter.name,
        });
      }
      if (!download.isCompleted) {
        await downloadChapter(subscription, download);
        await subscription.reload();
        if (subscription.status !== Subscription.Status.DOWNLOADING) return;
      }
    }
  }
}

async function downloadChapter(subscription, download) {
  const source = factory.getSource(download.source);
  const sourceChapter = download.sourceChapter;
  const targetManga = download.targetManga;
  const targetCollection = download.targetCollection;
  const targetChapter = download.targetChapter;

  const imageUrls = await source.requestChapterContent(sourceChapter);

  await subscription.reload();
  if (subscription.status !== Subscription.Status.DOWNLOADING) return;
  await download.update({ pageTotal: imageUrls.length });

  const chapterDir = path.join(config.libraryDir, targetManga, targetCollection, targetChapter);
  if (!fs.existsSync(chapterDir)) fs.mkdirSync(chapterDir);

  for (const [i, url] of imageUrls.entries()) {
    const imagePath = path.join(chapterDir, `${i}.jpg`);
    if (!fs.existsSync(imagePath)) {
      const stream = fs.createWriteStream(imagePath);
      await source.requestImage(url, stream);

      await subscription.reload();
      if (subscription.status !== Subscription.Status.DOWNLOADING) return;
      await download.update({ pageDownloaded: i + 1 });
    }
  }

  await download.update({ isCompleted: true });
}

export default { start };
