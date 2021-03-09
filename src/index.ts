import fs from 'fs';
import dotenv from 'dotenv';

import { logger } from './logger';
import { App } from './app';

/* read dotenv file */
dotenv.config();

/* parse environment variables */
const rootDir = parseEnvLibraryDir(process.env.APP_LIBRARY_DIR);

/* start application */
App.createInstance(rootDir)
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
