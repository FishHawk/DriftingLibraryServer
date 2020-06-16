import express from 'express';
const router = express.Router();

import library_router from './library.js';
import manga_router from './manga.js';
import chapter_router from './chapter.js';
import image_router from './image.js';

router.use(library_router);
router.use(manga_router);
router.use(chapter_router);
router.use(image_router);

router.get('/test', function (req, res) {
  res.send('Hello World!');
});

export default router;
