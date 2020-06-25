import express from 'express';

import error from '../error.js';
import { DownloadTask, DownloadTaskMode, DownloadTaskStatus } from '../model/download_task.js';
import downloader from '../provider/download.js';

const router = express.Router();

async function getDownloadTasks(req, res) {
  const orders = await DownloadTask.findAll();
  return res.json(orders);
}

async function postDownloadTask(req, res) {
  const source = req.body.source;
  const sourceMangaId = req.body.sourceMangaId;
  const targetMangaId = req.body.targetMangaId;
  const mode = Number.parseInt(req.body.mode);

  if (
    source === undefined ||
    sourceMangaId === undefined ||
    targetMangaId === undefined ||
    !DownloadTaskMode.isLegal(mode)
  )
    throw new error.BadRequestError('Download task arguments are illegal.');

  let task = await DownloadTask.findOne({
    where: {
      source,
      sourceMangaId,
      targetMangaId,
      mode,
    },
  });
  if (
    task !== null &&
    (task.status === DownloadTaskStatus.WAITING || task.status === DownloadTaskStatus.PROCESSING)
  )
    throw new error.ConflictError('Download task already exists.');

  if (task === null) {
    task = await DownloadTask.create({
      source,
      sourceMangaId,
      targetMangaId,
      mode,
    });
  } else {
    task.status = DownloadTaskStatus.WAITING;
    task.errorMessage = '';
  }
  await task.save();

  downloader.start();
  return res.json(task);
}

async function deleteDownloadTask(req, res) {
  const id = Number.parseInt(req.params.id);
  if (!Number.isInteger(id))
    throw new error.BadRequestError('Download task arguments are illegal.');

  const task = await DownloadTask.findByPk(id);
  if (task === null) throw new error.NotFoundError('Task does not exist.');

  await task.destroy();
  return res.json(task);
}

async function patchDownloadTask(req, res) {
  const id = Number.parseInt(req.params.id);
  const status = Number.parseInt(req.body.status);
  if (
    !Number.isInteger(id) ||
    (status !== DownloadTaskStatus.WAITING && status !== DownloadTaskStatus.PAUSED)
  )
    throw new error.BadRequestError('Download task arguments are illegal.');

  const task = await DownloadTask.findByPk(id);
  if (task === null) throw new error.NotFoundError('Task does not exist.');

  task.status = status;
  await task.save();

  downloader.start();
  return res.json(task);
}

router.get('/orders', error.errorWarp(getDownloadTasks));
router.post('/order', error.errorWarp(postDownloadTask));
router.delete('/order/:id', error.errorWarp(deleteDownloadTask));
router.patch('/order/:id', error.errorWarp(patchDownloadTask));

export default router;
