const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const router = require('./routes/index');
app.use('/', router);

const { errorHandler } = require('./error');
app.use('/api', errorHandler);

const config = require('./config');
const port = config.port;
app.listen(port, () => {
  console.log(`服务器启动：http://localhost:${port}`);
});
