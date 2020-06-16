import express from 'express';
import { getMangaList } from '../library/scan_library.js';
import { errorWarp } from '../error.js';

const router = express.Router();

async function get(req, res) {
  const last_id = req.query.last_id;
  const limit = parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 20;
  const filter = req.query.filter ? req.query.filter : '';

  const mangaList = getMangaList(last_id, limit, filter);
  return res.json(mangaList);
}

router.get('/library', errorWarp(get));

export default router;
