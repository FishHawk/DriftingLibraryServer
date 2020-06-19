import express from 'express';

import { ApplicationError, errorWarp } from '../error.js';
import Order from '../model/order.js';
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

router.get('/provider/orders', errorWarp(getOrders));
router.post('/provider/order', errorWarp(postOrder));
router.delete('/provider/order/:id', errorWarp(deleteOrder));
router.patch('/provider/order/:id', errorWarp(patchOrder));

export default router;
