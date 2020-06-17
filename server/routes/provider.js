import express from 'express';

import { ApplicationError, errorWarp } from '../error.js';
import factory from '../provider/source_factory.js';

const router = express.Router();

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

router.get('/provider/sources', errorWarp(getSources));
router.get('/provider/search', errorWarp(search));

// router.get('/provider/orders', errorWarp(getOrders));
// router.delete('/provider/orders', errorWarp(deleteOrders));

// router.get('/provider/order', errorWarp(getOrder));
// router.post('/provider/order', errorWarp(postOrder));
// router.delete('/provider/order', errorWarp(deleteOrder));

export default router;
