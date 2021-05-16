import fs from 'fs';
import dotenv from 'dotenv';

import { logger } from './logger';
import { App } from './app';

/* read dotenv file */
dotenv.config();

/* parse environment variables */
const libraryDir = parseEnvLibraryDir(process.env.LIBRARY_DIR);
const port = parseEnvPort(process.env.PORT);

/* start application */
App.createInstance(libraryDir, port)
  .then((app) => app.listen())
  .catch((e) => {
    logger.error(e.stack);
    process.exit(1);
  });

/* helper */
function parseEnvLibraryDir(envDir: string | undefined): string {
  if (envDir !== undefined) {
    if (fs.statSync(envDir).isDirectory()) {
      logger.info(`Set root dir ${envDir}`);
      return envDir;
    }
  }
  logger.error(`Root dir does not exist.`);
  process.exit(1);
}

function parseEnvPort(envPort: string | undefined): number {
  const port = envPort ? Number.parseInt(envPort) : 8080;
  if (port > 0 && port < 65535) {
    logger.info(`Set port ${port}`);
    return port;
  } else {
    logger.error(`Illegal port ${port}.`);
    process.exit(1);
  }
}
