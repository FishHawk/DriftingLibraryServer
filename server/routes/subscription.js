import { Sequelize } from 'sequelize';
import express from 'express';

import error from '../error.js';
import DownloadTask from '../model/download_task.js';
import DownloadChapterTask from '../model/download_chapter_task.js';
import Subscription from '../model/subscription.js';
import Manga from '../model/manga.js';
import downloader from '../provider/downloader.js';

const Op = Sequelize.Op;
const router = express.Router();

router.get('/subscriptions', error.errorWarp(getAllSubscription));
router.patch('/subscriptions/enable', error.errorWarp(enableAllSubscription));
router.patch('/subscriptions/disable', error.errorWarp(disableAllSubscription));

router.post('/subscription', error.errorWarp(postSubscription));
router.delete('/subscription/:id', error.errorWarp(deleteSubscription));
router.patch('/subscription/:id/enable', error.errorWarp(enableSubscription));
router.patch('/subscription/:id/disable', error.errorWarp(disableSubscription));

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
    throw new error.BadRequestError('Arguments are illegal.');

  const manga = await Manga.Model.findByPk(targetManga);
  if (manga !== null) throw new error.ConflictError('Already exists.');

  await Manga.Model.create({
    id: targetManga,
  });
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

  downloader.start();
  return res.json(subscription);
}

async function deleteSubscription(req, res) {
  const id = Number.parseInt(req.params.id);

  if (!Number.isInteger(id)) throw new error.BadRequestError('Arguments are illegal.');

  const subscription = await Subscription.Model.findByPk(id);
  if (subscription === null) throw new error.NotFoundError('Not found.');

  await DownloadTask.Model.destroy({ where: { targetManga: subscription.targetManga } });
  await DownloadChapterTask.Model.destroy({ where: { targetManga: subscription.targetManga } });
  await subscription.destroy();
  return res.json(subscription);
}

async function enableSubscription(req, res) {
  const id = Number.parseInt(req.params.id);

  if (!Number.isInteger(id)) throw new error.BadRequestError('Arguments are illegal.');

  const subscription = await Subscription.Model.findByPk(id);
  if (subscription === null) throw new error.NotFoundError('Not found.');

  await subscription.update({ isEnabled: true });
  return res.json(subscription);
}

async function disableSubscription(req, res) {
  const id = Number.parseInt(req.params.id);

  if (!Number.isInteger(id)) throw new error.BadRequestError('Arguments are illegal.');

  const subscription = await Subscription.Model.findByPk(id);
  if (subscription === null) throw new error.NotFoundError('Not found.');

  await subscription.update({ isEnabled: false });
  return res.json(subscription);
}

export default router;
