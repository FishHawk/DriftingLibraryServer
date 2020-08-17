import fs from 'fs';
import { logger } from './logger.js';

if (process.argv.length != 4) {
  logger.error(`Wrong number of parameters.`);
  process.exit(1);
}

export const port = parseInt(process.argv[2]);
logger.info(`Init: Config port ${port}`);
if (!(port > 1023 && port <= 65535)) {
  logger.error(`Illegal port number. Should be between 1024 and 65535.`);
  process.exit(1);
}

export const libraryDir = process.argv[3];
logger.info(`Init: Config library dir ${libraryDir}`);
if (!(fs.existsSync(libraryDir) && fs.lstatSync(libraryDir).isDirectory())) {
  logger.error(`Library dir does not exist.`);
  process.exit(1);
}
