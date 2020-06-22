import express from 'express';
import { getMangaDetail } from '../library/scan_library.js';
import { ApplicationError, errorWarp } from '../error.js';

const router = express.Router();

async function get(req, res) {
  const id = req.params.id;
  const mangaDetail = getMangaDetail(id);

  if (!mangaDetail) throw new ApplicationError(404, 'Manga not found.');
  console.log(mangaDetail)
  return res.json(mangaDetail);
}

router.get('/manga/:id', errorWarp(get));

export default router;
