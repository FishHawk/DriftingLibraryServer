import express from 'express';

import error from '../error.js';
import sources from '../provider/sources.js';

const router = express.Router();

router.get('/sources', error.errorWarp(getSources));
router.get('/source/:source/search', error.errorWarp(search));
router.get('/source/:source/popular', error.errorWarp(getPopular));
router.get('/source/:source/latest', error.errorWarp(getLatest));
router.get('/source/:source/manga/:id', error.errorWarp(getManga));
router.get('/source/:source/chapter/:id', error.errorWarp(getChapter));
router.get('/source/:source/image/:url', error.errorWarp(getImage));

async function getSources(req, res) {
  return res.json(sources.getAllSource());
}

async function search(req, res) {
  const source = sources.getSource(req.params.source);
  if (source == undefined) throw new error.ApplicationError(500, 'Source not support.');

  const keywords = req.query.keywords ? req.query.keywords : '';
  const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
  const mangaList = await source.search(page, keywords);
  return res.json(mangaList);
}

async function getPopular(req, res) {
  const source = sources.getSource(req.params.source);
  if (source == undefined) throw new error.ApplicationError(500, 'Source not support.');

  const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
  const mangaList = await source.requestPopular(page);
  return res.json(mangaList);
}

async function getLatest(req, res) {
  const source = sources.getSource(req.params.source);
  if (source == undefined) throw new error.ApplicationError(500, 'Source not support.');

  const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
  const mangaList = await source.requestLatest(page);
  return res.json(mangaList);
}

async function getManga(req, res) {
  const source = sources.getSource(req.params.source);
  if (source == undefined) throw new error.ApplicationError(500, 'Source not support.');

  const id = req.params.id;
  const detail = await source.requestMangaDetail(id);
  return res.json(detail);
}

async function getChapter(req, res) {
  const sourceName = req.params.source;
  const source = sources.getSource(sourceName);
  if (source == undefined) throw new error.ApplicationError(500, 'Source not support.');

  const id = req.params.id;
  const imageUrls = await source.requestChapterContent(id);
  const imageProxyUrls = imageUrls.map((x) => {
    return `source/${encodeURIComponent(sourceName)}/image/${encodeURIComponent(x)}`;
  });
  return res.json(imageProxyUrls);
}

async function getImage(req, res) {
  const source = sources.getSource(req.params.source);
  if (source == undefined) throw new error.ApplicationError(500, 'Source not support.');

  const url = req.params.url;
  await source.requestImage(url, res);
}

export default router;