import express from 'express';

import { logger } from '../logger.js';

import { HttpError } from './httpError.js';

import routerLibrary from './library.js';
import routerSource from './source.js';
import routerDownload from './download.js';
import routerSubscription from './subscription.js';

const router = express.Router();

// log request
router.use(function (req, res, next) {
  logger.info(`Request: ${req.method} ${req.url}`);
  next();
});

// use router
router.use(routerLibrary);
router.use(routerSource);
router.use(routerDownload);
router.use(routerSubscription);

router.get('/test', function (req, res) {
  res.send('Hello World!');
});

// handle error
router.use((err, req, res, next) => {
  logger.error(err.stack);
  if (err instanceof HttpError) res.status(err.status).send(err.message);
  else res.status(500).send('Unexceped error.');
});

export default router;
