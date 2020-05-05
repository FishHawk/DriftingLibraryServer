const express = require('express');
const { getMangaDetail } = require('../models/scan_library');
const { ApplicationError, errorWarp } = require('../error');

const router = express.Router();

async function get(req, res) {
  const id = req.params.id;
  const mangaDetail = getMangaDetail(id);

  if (!mangaDetail) throw new ApplicationError(404, 'Manga not found.');
  return res.json(mangaDetail);
}

router.get('/manga/:id', errorWarp(get));

module.exports = router;
