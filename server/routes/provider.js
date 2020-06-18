import express from 'express';

import { ApplicationError, errorWarp } from '../error.js';
import Order from '../model/order.js';
import factory from '../provider/source_factory.js';
import downloadJobQueue from '../provider/download_job_queue.js';

const router = express.Router();

function parseBoolean(string) {
  if (string === 'true') return true;
  else if (string === 'false') return false;
  else return null;
}

async function getSources(req, res) {
  const sources = factory.getAllSourceName();
  return res.json(sources);
}

async function search(req, res) {
  const sourceName = req.query.source;
  const keyword = req.query.keyword;
  const page = 1;

  const source = factory.getSource(sourceName);
  if (source == null) throw new ApplicationError(500, 'Source not support.');

  const mangaList = await source.search(keyword, page);
  return res.json(mangaList);
}

async function getOrders(req, res) {
  const orders = await Order.findAll();
  return res.json(orders);
}

async function postOrder(req, res) {
  const order = await Order.create({
    source: req.body.source,
    sourceMangaId: req.body.sourceMangaId,
    targetMangaId: req.body.targetMangaId,
  });
  downloadJobQueue.add(order);
  return res.sendStatus(200);
}

async function deleteOrder(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) throw ApplicationError(400, 'Can not parse id.');

  const order = await Order.findByPk(id);
  if (order === null) throw ApplicationError(404, 'Order not found.');

  await order.destroy();
  return res.sendStatus(200);
}

async function patchOrder(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) throw ApplicationError(400, 'Illegal id.');

  const isActive = parseBoolean(req.body.isActive);
  if (isActive === null) throw ApplicationError(400, 'Illegal isActive.');

  const order = await Order.findByPk(id);
  if (order === null) throw ApplicationError(404, 'Order not found.');

  if (isActive === true && order.isActive === false) {
    order.isActive = false;
    order.status = 'waiting';
    await order.save();
    downloadJobQueue.add(order);
  } else if (isActive === false && order.isActive === true) {
    // TODO
  }
  return res.sendStatus(200);
}

async function getManga(req, res) {
  const sourceName = req.params.source;
  const id = req.params.id;

  const source = factory.getSource(sourceName);
  if (source == null) throw new ApplicationError(500, 'Source not support.');

  const detail = await source.getMangaDetail(id);
  return res.json(detail);
}

async function getChapter(req, res) {
  const sourceName = req.params.source;
  const id = req.params.id;

  const source = factory.getSource(sourceName);
  if (source == null) throw new ApplicationError(500, 'Source not support.');

  const imageList = await source.getChapter(id);
  return res.json(imageList);
}

router.get('/provider/sources', errorWarp(getSources));
router.get('/provider/search', errorWarp(search));

router.get('/provider/orders', errorWarp(getOrders));
router.post('/provider/order', errorWarp(postOrder));
router.delete('/provider/order/:id', errorWarp(deleteOrder));
router.patch('/provider/order/:id', errorWarp(patchOrder));

router.get('/provider/manga/:source/:id', errorWarp(getManga));
router.get('/provider/chapter/:source/:id', errorWarp(getChapter));

export default router;
