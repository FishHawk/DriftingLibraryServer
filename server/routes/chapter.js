import express from 'express';
import { getChapterContent } from '../library/scan_library.js';
import error from '../error.js';

const router = express.Router();

async function get(req, res) {
  const id = req.params.id;
  const collectionTitle = req.query.collection ? req.query.collection : '';
  const chapterTitle = req.query.chapter ? req.query.chapter : '';

  const chapterContent = getChapterContent(id, collectionTitle, chapterTitle);
  if (!chapterContent) throw new error.ApplicationError(404, 'Chapter not found.');
  return res.json(chapterContent);
}

router.get('/chapter/:id', error.errorWarp(get));

export default router;
