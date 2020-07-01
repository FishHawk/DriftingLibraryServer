import { Sequelize } from 'sequelize';
import express from 'express';

import error from '../error.js';
import Download from '../model/download.js';
import Subscription from '../model/subscription.js';
import Manga from '../model/manga.js';
import downloader from '../provider/downloader.js';

const Op = Sequelize.Op;
const router = express.Router();

router.get('/downloads', error.errorWarp(getAllDownload));
router.patch('/downloads/start', error.errorWarp(startAllDownload));
router.patch('/downloads/pause', error.errorWarp(pauseAllDownload));

async function getAllDownload(req, res) {
  const downloads = await Subscription.Model.findAll({
    where: { status: { [Op.not]: Subscription.Status.COMPLETED } },
  });
  return res.json(downloads);
}

async function startAllDownload(req, res) {
  await Subscription.Model.update(
    { status: Subscription.Status.WAITING },
    { where: { mode: { [Op.or]: [Subscription.Status.PAUSED, Subscription.Status.ERROR] } } }
  );

  const downloads = await Subscription.Model.findAll({
    where: { status: { [Op.not]: Subscription.Status.COMPLETED } },
  });
  downloader.start();
  return res.json(downloads);
}

async function pauseAllDownload(req, res) {
  await Subscription.Model.update(
    { status: Subscription.Status.PAUSED },
    { where: { mode: { [Op.or]: [Subscription.Status.WAITING, Subscription.Status.DOWNLOADING] } } }
  );

  const downloads = await Subscription.Model.findAll({
    where: { status: { [Op.not]: Subscription.Status.COMPLETED } },
  });
  return res.json(downloads);
}

async function postDownload(req, res) {
  const source = req.body.source;
  const sourceManga = req.body.sourceManga;
  const targetManga = req.body.targetManga;

  if (source === undefined || sourceManga === undefined || targetManga === undefined)
    throw new error.BadRequestError('Arguments are illegal.');

  const downloadInDb = await Subscription.Model.findOne({ where: { targetManga } });
  if (downloadInDb !== null) throw new error.ConflictError('Already exists.');

  const manga = await Manga.Model.findOne({ where: { id: targetManga } });
  if (manga !== null) throw new error.ConflictError('Already exists.');

  const download = await Subscription.Model.create({
    source,
    sourceManga,
    targetManga,
    mode: Subscription.Mode.DISPOSABLE,
  });
  downloader.start();
  return res.json(download);
}

export default router;
