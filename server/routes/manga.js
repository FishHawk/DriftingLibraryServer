import express from 'express';
import { getMangaDetail } from '../library/scan_library.js';
import error from '../error.js';

const router = express.Router();

async function get(req, res) {
  const id = req.params.id;
  const mangaDetail = getMangaDetail(id);

  if (!mangaDetail) throw new error.ApplicationError(404, 'Manga not found.');
  return res.json(mangaDetail);
}

router.get('/manga/:id', error.errorWarp(get));

export default router;
