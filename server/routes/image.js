import express from 'express';
import path from 'path';
import config from '../config.js';

const router = express.Router();

router.use('/image', function (req, res, next) {
  express.static(config.libraryDir)(req, res, next);
});

export default router;
