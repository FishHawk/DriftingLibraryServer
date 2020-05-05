const express = require('express');
const path = require('path');
const config = require('../config');

const router = express.Router();

const resolve = (file) => path.resolve(__dirname, file);
router.use('/image', function (req, res, next) {
  express.static(resolve(config.libraryDir))(req, res, next);
});

module.exports = router;
