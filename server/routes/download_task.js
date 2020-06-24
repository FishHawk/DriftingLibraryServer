import express from 'express';

import { ApplicationError, errorWarp } from '../error.js';
import { DownloadTask, DownloadTaskMode } from '../model/download_task.js';
import downloadTaskQueue from '../provider/download.js';

const router = express.Router();

function parseBoolean(string) {
  if (string === 'true') return true;
  else if (string === 'false') return false;
  else return null;
}

async function getDownloadTasks(req, res) {
  const orders = await DownloadTask.findAll();
  return res.json(orders);
}

async function postDownloadTask(req, res) {
  const mode = Number.parseInt(req.body.mode);
  if (!DownloadTaskMode.isLegal(mode)) throw new ApplicationError(400, 'Can not parse mode.');

  const order = await DownloadTask.create({
    source: req.body.source,
    sourceMangaId: req.body.sourceMangaId,
    targetMangaId: req.body.targetMangaId,
    mode: mode,
  });
  downloadTaskQueue.add(order);
  return res.status(200).json(order);
}

async function deleteDownloadTask(req, res) {
  const id = Number.parseInt(req.params.id);
  if (!Number.isInteger(id)) throw new ApplicationError(400, 'Can not parse id.');

  const order = await DownloadTask.findByPk(id);
  if (order === null) throw new ApplicationError(404, 'Task not found.');

  await order.destroy();
  return res.status(200).json(order);
}

async function patchDownloadTask(req, res) {
  const id = Number.parseInt(req.params.id);
  if (!Number.isInteger(id)) throw new ApplicationError(400, 'Illegal id.');

  const active = parseBoolean(req.body.active);
  if (active === null) throw new ApplicationError(400, 'Illegal isActive.');

  const order = await DownloadTask.findByPk(id);
  if (order === null) throw new ApplicationError(404, 'Task not found.');

  // TODO
  return;

  return res.sendStatus(200);
}

router.get('/orders', errorWarp(getDownloadTasks));
router.post('/order', errorWarp(postDownloadTask));
router.delete('/order/:id', errorWarp(deleteDownloadTask));
router.patch('/order/:id', errorWarp(patchDownloadTask));

export default router;
