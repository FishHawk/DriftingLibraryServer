const express = require('express');
const router = express.Router();

const library_router = require('./library');
const manga_router = require('./manga');
const chapter_router = require('./chapter');
const image_router = require('./image');

router.use(library_router);
router.use(manga_router);
router.use(chapter_router);
router.use(image_router);

router.get('/test', function (req, res) {
  res.send('Hello World!');
});

module.exports = router;
