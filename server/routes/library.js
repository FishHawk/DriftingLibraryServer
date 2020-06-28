import express from 'express';

import config from '../config.js';
import error from '../error.js';
import Manga from '../model/manga.js';
import { getMangaDetail, getChapterContent } from '../library/scan_library.js';
import { MangaOutline } from '../data/manga.js';

const router = express.Router();

router.get('/library/search', error.errorWarp(search));
router.get('/library/manga/:id', error.errorWarp(getManga));
router.get('/library/chapter/:id', error.errorWarp(getChapter));
router.use('/library/image', function (req, res, next) {
  express.static(config.libraryDir)(req, res, next);
});

async function search(req, res) {
  const last_id = req.query.last_id;
  const limit = parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 20;
  const filter = req.query.filter ? req.query.filter : '';

  // const mangaList = getMangaList(last_id, limit, filter);
  const mangaList = await Manga.Model.findAll().map((x) => {
    return new MangaOutline({
      id: x.id,
      title: x.title,
      thumb: x.thumb,
    });
  });
  return res.json(mangaList);
}

async function getManga(req, res) {
  const id = req.params.id;
  const mangaDetail = getMangaDetail(id);

  if (!mangaDetail) throw new error.ApplicationError(404, 'Manga not found.');
  return res.json(mangaDetail);
}

async function getChapter(req, res) {
  const id = req.params.id;
  const collectionTitle = req.query.collection ? req.query.collection : '';
  const chapterTitle = req.query.chapter ? req.query.chapter : '';

  const chapterContent = getChapterContent(id, collectionTitle, chapterTitle);
  if (!chapterContent) throw new error.ApplicationError(404, 'Chapter not found.');
  return res.json(chapterContent);
}

export default router;
