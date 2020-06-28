import express from 'express';

import routerLibrary from './library.js';
import routerSource from './source.js';
import routerSubscription from './subscription.js';

const router = express.Router();

router.use(routerLibrary);
router.use(routerSource);
router.use(routerSubscription);

router.get('/test', function (req, res) {
  res.send('Hello World!');
});

export default router;
