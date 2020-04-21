const express = require('express');
const { getMangaList } = require('../models/scan_library');
const { errorWarp } = require('../error');

const router = express.Router();

async function get(req, res) {
  const last_id = req.query.last_id;
  const limit = parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 20;

  const mangaList = getMangaList(last_id, limit);
  return res.json(mangaList);
}

router.get('/library', errorWarp(get));

module.exports = router;
