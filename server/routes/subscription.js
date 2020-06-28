import express, { json } from 'express';

import error from '../error.js';
import Download from '../model/download.js';
import Subscription from '../model/subscription.js';
import Manga from '../model/manga.js';
import downloader from '../provider/downloader.js';

const router = express.Router();

router.get('/subscriptions', error.errorWarp(getSubscription));
router.post('/subscription', error.errorWarp(postSubscription));
router.delete('/subscription/:id', error.errorWarp(deleteSubscription));
router.patch('/subscription/:id', error.errorWarp(patchSubscription));

async function getSubscription(req, res) {
  const subscriptions = await Subscription.Model.findAll({
    where: { mode: { $not: Subscription.Mode.DISPOSABLE } },
  });
  return res.json(subscriptions);
}

async function postSubscription(req, res) {
  const source = req.body.source;
  const sourceManga = req.body.sourceManga;
  const targetManga = req.body.targetManga;
  const mode = Subscription.Mode.parse(req.body.mode);

  if (
    source === undefined ||
    sourceManga === undefined ||
    targetManga === undefined ||
    mode === null
  )
    throw new error.BadRequestError('Arguments are illegal.');

  const subscriptionInDb = await Subscription.Model.findOne({ where: { targetManga } });
  if (subscriptionInDb !== null) throw new error.ConflictError('Already exists.');

  const manga = await Manga.Model.findOne({ where: { id: targetManga } });
  if (manga !== null) throw new error.ConflictError('Already exists.');

  const subscription = await Subscription.Model.create({
    source,
    sourceManga,
    targetManga,
    mode,
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

async function patchSubscription(req, res) {
  const id = Number.parseInt(req.params.id);
  const mode = Subscription.Mode.parse(req.body.mode);

  if (
    !Number.isInteger(id) ||
    (mode !== Subscription.Mode.ENABLED && mode !== Subscription.Mode.DISABLED)
  )
    throw new error.BadRequestError('Arguments are illegal.');

  const subscription = await Subscription.Model.findByPk(id);
  if (subscription === null) throw new error.NotFoundError('Not found.');

  subscription.mode = mode;
  await subscription.save();

  downloader.start();
  return json(subscription);
}

export default router;
