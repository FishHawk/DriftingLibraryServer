import express from 'express';

import { ApplicationError, errorWarp } from '../error.js';
import { Order, OrderMode } from '../model/order.js';
import downloadJobQueue from '../provider/download_job_queue.js';

const router = express.Router();

function parseBoolean(string) {
  if (string === 'true') return true;
  else if (string === 'false') return false;
  else return null;
}

async function getOrders(req, res) {
  const orders = await Order.findAll();
  return res.json(orders);
}

async function postOrder(req, res) {
  const mode = Number.parseInt(req.body.mode);
  if (!OrderMode.isLegal(mode)) throw new ApplicationError(400, 'Can not parse mode.');

  const order = await Order.create({
    source: req.body.source,
    sourceMangaId: req.body.sourceMangaId,
    targetMangaId: req.body.targetMangaId,
    mode: mode,
  });
  downloadJobQueue.add(order);
  return res.status(200).json(order);
}

async function deleteOrder(req, res) {
  const id = Number.parseInt(req.params.id);
  if (!Number.isInteger(id)) throw new ApplicationError(400, 'Can not parse id.');

  const order = await Order.findByPk(id);
  if (order === null) throw new ApplicationError(404, 'Order not found.');

  await order.destroy();
  return res.status(200).json(order);
}

async function patchOrder(req, res) {
  const id = Number.parseInt(req.params.id);
  if (!Number.isInteger(id)) throw new ApplicationError(400, 'Illegal id.');

  const active = parseBoolean(req.body.active);
  if (active === null) throw new ApplicationError(400, 'Illegal isActive.');

  const order = await Order.findByPk(id);
  if (order === null) throw new ApplicationError(404, 'Order not found.');

  // TODO
  return;

  return res.sendStatus(200);
}

router.get('/orders', errorWarp(getOrders));
router.post('/order', errorWarp(postOrder));
router.delete('/order/:id', errorWarp(deleteOrder));
router.patch('/order/:id', errorWarp(patchOrder));

export default router;
