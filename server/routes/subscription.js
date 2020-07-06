import express from 'express';

import { errorWarp, ConflictError, BadRequestError, NotFoundError } from '../error.js';
import { isMangaExist, createManga } from '../library/library.js';
import { startDownloader, cancelCurrentDownload, isMangaDownloading } from '../provider/downloader.js';

import DownloadTask from '../model/download_task.js';
import DownloadChapterTask from '../model/download_chapter_task.js';
import Subscription from '../model/subscription.js';

const router = express.Router();

router.get('/subscriptions', errorWarp(getAllSubscription));
router.patch('/subscriptions/enable', errorWarp(enableAllSubscription));
router.patch('/subscriptions/disable', errorWarp(disableAllSubscription));

router.post('/subscription', errorWarp(postSubscription));
router.delete('/subscription/:id', errorWarp(deleteSubscription));
router.patch('/subscription/:id/enable', errorWarp(enableSubscription));
router.patch('/subscription/:id/disable', errorWarp(disableSubscription));

async function getAllSubscription(req, res) {
  const subscriptions = await Subscription.Model.findAll();
  return res.json(subscriptions);
}

async function enableAllSubscription(req, res) {
  await Subscription.Model.update({ isEnabled: true });
  const subscriptions = await Subscription.Model.findAll();
  return res.json(subscriptions);
}

async function disableAllSubscription(req, res) {
  await Subscription.Model.update({ isEnabled: false });
  const subscriptions = await Subscription.Model.findAll();
  return res.json(subscriptions);
}

async function postSubscription(req, res) {
  const source = req.body.source;
  const sourceManga = req.body.sourceManga;
  const targetManga = req.body.targetManga;

  if (source === undefined || sourceManga === undefined || targetManga === undefined)
    throw new BadRequestError('Arguments are illegal.');

  if (isMangaExist(targetManga)) throw new ConflictError('Already exists.');
  createManga(targetManga);

  await DownloadTask.Model.create({
    source,
    sourceManga,
    targetManga,
    isCreatedBySubscription: true,
  });
  const subscription = await Subscription.Model.create({
    source,
    sourceManga,
    targetManga,
  });

  startDownloader();
  return res.json(subscription);
}

async function deleteSubscription(req, res) {
  const id = Number.parseInt(req.params.id);

  if (!Number.isInteger(id)) throw new BadRequestError('Arguments are illegal.');

  const subscription = await Subscription.Model.findByPk(id);
  if (subscription === null) throw new NotFoundError('Not found.');

  await DownloadTask.Model.destroy({ where: { targetManga: subscription.targetManga } });
  await DownloadChapterTask.Model.destroy({ where: { targetManga: subscription.targetManga } });
  await subscription.destroy();
  if (isMangaDownloading(id)) cancelCurrentDownload()
  return res.json(subscription);
}

async function enableSubscription(req, res) {
  const id = Number.parseInt(req.params.id);

  if (!Number.isInteger(id)) throw new BadRequestError('Arguments are illegal.');

  const subscription = await Subscription.Model.findByPk(id);
  if (subscription === null) throw new NotFoundError('Not found.');

  await subscription.update({ isEnabled: true });
  return res.json(subscription);
}

async function disableSubscription(req, res) {
  const id = Number.parseInt(req.params.id);

  if (!Number.isInteger(id)) throw new BadRequestError('Arguments are illegal.');

  const subscription = await Subscription.Model.findByPk(id);
  if (subscription === null) throw new NotFoundError('Not found.');

  await subscription.update({ isEnabled: false });
  return res.json(subscription);
}

export default router;
