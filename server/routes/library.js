import express from 'express';

import { errorWarp, NotFoundError } from '../error.js';
import {
  libraryDir,
  searchLibrary,
  parseMangaDetail,
  parseChapterContent,
} from '../library/library.js';

const router = express.Router();

router.get('/library/search', errorWarp(search));
router.get('/library/manga/:id', errorWarp(getManga));
router.get('/library/chapter/:id', errorWarp(getChapter));
router.use('/library/image', function (req, res, next) {
  express.static(libraryDir)(req, res, next);
});

async function search(req, res) {
  const lastId = req.query.lastId;
  const limit = parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 20;
  const keywords = req.query.keywords ? req.query.keywords : '';

  const outlines = searchLibrary(lastId, limit, keywords);

  return res.json(outlines);
}

async function getManga(req, res) {
  const id = req.params.id;

  const detail = parseMangaDetail(id);
  if (detail === null) throw new NotFoundError('Manga not found.');

  return res.json(mangaDetail);
}

async function getChapter(req, res) {
  const id = req.params.id;
  const collectionTitle = req.query.collection ? req.query.collection : '';
  const chapterTitle = req.query.chapter ? req.query.chapter : '';

  const content = parseChapterContent(id, collectionTitle, chapterTitle);
  if (content === null) throw new NotFoundError('Chapter not found.');

  return res.json(content);
}

export default router;
