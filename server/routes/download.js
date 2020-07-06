import { Sequelize } from 'sequelize';
import express from 'express';

import { errorWarp, ConflictError, BadRequestError, NotFoundError } from '../error.js';
import {
  startDownloader,
  cancelCurrentDownload,
  isMangaDownloading,
} from '../provider/downloader.js';

import DownloadTask from '../model/download_task.js';
import DownloadChapterTask from '../model/download_chapter_task.js';

const Op = Sequelize.Op;
const router = express.Router();

router.get('/downloads', errorWarp(getAllDownloadTask));
router.patch('/downloads/start', errorWarp(startAllDownloadTask));
router.patch('/downloads/pause', errorWarp(pauseAllDownloadTask));

router.post('/download', errorWarp(postDownloadTask));
router.delete('/download/:id', errorWarp(deleteDownloadTask));
router.patch('/download/:id/start', errorWarp(startDownloadTask));
router.patch('/download/:id/pause', errorWarp(pauseDownloadTask));

async function getAllDownloadTask(req, res) {
  const tasks = await DownloadTask.Model.findAll();
  return res.json(tasks);
}

async function startAllDownloadTask(req, res) {
  await DownloadTask.Model.update(
    { status: DownloadTask.Status.WAITING },
    {
      where: {
        status: { [Op.or]: [DownloadTask.Status.PAUSED, DownloadTask.Status.ERROR] },
      },
    }
  );

  const tasks = await DownloadTask.Model.findAll();
  startDownloader();
  return res.json(tasks);
}

async function pauseAllDownloadTask(req, res) {
  await DownloadTask.Model.update(
    { status: DownloadTask.Status.PAUSED },
    {
      where: {
        status: {
          [Op.or]: [DownloadTask.Status.WAITING, DownloadTask.Status.DOWNLOADING],
        },
      },
    }
  );

  const tasks = await DownloadTask.Model.findAll();
  cancelCurrentDownload();
  return res.json(tasks);
}

async function postDownloadTask(req, res) {
  const source = req.body.source;
  const sourceManga = req.body.sourceManga;
  const targetManga = req.body.targetManga;

  if (source === undefined || sourceManga === undefined || targetManga === undefined)
    throw new BadRequestError('Arguments are illegal.');

  const manga = await Manga.Model.findOne({ where: { id: targetManga } });
  if (manga !== null) throw new ConflictError('Already exists.');

  await Manga.Model.create({
    id: targetManga,
  });
  const task = await DownloadTask.Model.create({
    source,
    sourceManga,
    targetManga,
    isCreatedBySubscription: false,
  });
  startDownloader();
  return res.json(task);
}

async function deleteDownloadTask(req, res) {
  const id = Number.parseInt(req.params.id);

  if (!Number.isInteger(id)) throw new BadRequestError('Arguments are illegal.');

  const task = await DownloadTask.Model.findByPk(id);
  if (task === null) throw new NotFoundError('Not found.');

  if (!task.isCreatedBySubscription) {
    await DownloadChapterTask.Model.destroy({ where: { targetManga: task.targetManga } });
  }
  await task.destroy();
  if (isMangaDownloading(task.targetManga)) cancelCurrentDownload();
  return res.json(task);
}

async function startDownloadTask(req, res) {
  const id = Number.parseInt(req.params.id);

  if (!Number.isInteger(id)) throw new BadRequestError('Arguments are illegal.');

  const task = await DownloadTask.Model.findByPk(id);
  if (task === null) throw new NotFoundError('Not found.');

  if (task.status === DownloadTask.Status.PAUSED || task.status === DownloadTask.Status.ERROR) {
    await task.update({ status: DownloadTask.Status.WAITING });
  }
  startDownloader();
  return res.json(task);
}

async function pauseDownloadTask(req, res) {
  const id = Number.parseInt(req.params.id);

  if (!Number.isInteger(id)) throw new BadRequestError('Arguments are illegal.');

  const task = await DownloadTask.Model.findByPk(id);
  if (task === null) throw new NotFoundError('Not found.');

  if (
    task.status === DownloadTask.Status.DOWNLOADING ||
    task.status === DownloadTask.Status.WAITING
  ) {
    await task.update({ status: DownloadTask.Status.PAUSED });
  }
  if (isMangaDownloading(task.targetManga)) cancelCurrentDownload();
  return res.json(task);
}

export default router;
