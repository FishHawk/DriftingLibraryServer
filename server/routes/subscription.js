import { Sequelize } from 'sequelize';
import express from 'express';

import error from '../error.js';
import Download from '../model/download.js';
import Subscription from '../model/subscription.js';
import Manga from '../model/manga.js';
import downloader from '../provider/downloader.js';

const Op = Sequelize.Op;
const router = express.Router();

router.get('/subscriptions', error.errorWarp(getSubscription));
router.post('/subscription', error.errorWarp(postSubscription));
router.delete('/subscription/:id', error.errorWarp(deleteSubscription));
router.patch('/subscription/:id/enable', error.errorWarp(enableSubscription));
router.patch('/subscription/:id/disable', error.errorWarp(disableSubscription));

async function getSubscription(req, res) {
  const subscriptions = await Subscription.Model.findAll({
    where: { mode: { [Op.not]: Subscription.Mode.DISPOSABLE } },
  });
  return res.json(subscriptions);
}

async function postSubscription(req, res) {
  const source = req.body.source;
  const sourceManga = req.body.sourceManga;
  const targetManga = req.body.targetManga;

  if (source === undefined || sourceManga === undefined || targetManga === undefined)
    throw new error.BadRequestError('Arguments are illegal.');

  const subscriptionInDb = await Subscription.Model.findOne({ where: { targetManga } });
  if (subscriptionInDb !== null) throw new error.ConflictError('Already exists.');

  const manga = await Manga.Model.findOne({ where: { id: targetManga } });
  if (manga !== null) throw new error.ConflictError('Already exists.');

  const subscription = await Subscription.Model.create({
    source,
    sourceManga,
    targetManga,
    mode: Subscription.Mode.ENABLED,
  });
  downloader.start();
  return res.json(subscription);
}

async function deleteSubscription(req, res) {
  const id = Number.parseInt(req.params.id);

  if (!Number.isInteger(id)) throw new error.BadRequestError('Arguments are illegal.');

  const subscription = await Subscription.Model.findByPk(id);
  if (subscription === null) throw new error.NotFoundError('Not found.');

  await Download.Model.destroy({ where: { targetManga: subscription.targetManga } });
  await subscription.destroy();
  return res.json(subscription);
}

async function enableSubscription(req, res) {
  const id = Number.parseInt(req.params.id);

  if (!Number.isInteger(id)) throw new error.BadRequestError('Arguments are illegal.');

  const subscription = await Subscription.Model.findByPk(id);
  if (subscription === null) throw new error.NotFoundError('Not found.');

  await subscription.update({ mode: Subscription.Mode.ENABLED });
  downloader.start();
  return res.json(subscription);
}

async function disableSubscription(req, res) {
  const id = Number.parseInt(req.params.id);

  if (!Number.isInteger(id)) throw new error.BadRequestError('Arguments are illegal.');

  const subscription = await Subscription.Model.findByPk(id);
  if (subscription === null) throw new error.NotFoundError('Not found.');

  await subscription.update({ mode: Subscription.Mode.DISABLED });
  downloader.start();
  return res.json(subscription);
}

export default router;
