import express from 'express';

import library_router from './library.js';
import manga_router from './manga.js';
import chapter_router from './chapter.js';
import image_router from './image.js';
import source_router from './source.js';
import download_task_router from './download_task.js';

const router = express.Router();

router.use(library_router);
router.use(manga_router);
router.use(chapter_router);
router.use(image_router);

router.use(source_router);
router.use(download_task_router);

router.get('/test', function (req, res) {
  res.send('Hello World!');
});

export default router;
