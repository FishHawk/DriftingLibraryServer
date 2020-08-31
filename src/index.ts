import fs from 'fs';
import dotenv from 'dotenv';

import { logger } from './logger';
import { App } from './app';

/*
 * Read .env file
 */
dotenv.config();

/*
 * Parse environment variables
 */
const port = parseEnvPort(process.env.APP_PORT);
const libraryDir = parseEnvLibraryDir(process.env.APP_LIBRARY_DIR);

/*
 * Start application
 */
App.createApplication(port, libraryDir)
  .then((app) => {
    app.listen();
  })
  .catch((e) => {
    logger.error(e);
  });

/*
 * Helper function
 */
function parseEnvPort(envPort: string | undefined): number {
  if (envPort !== undefined) {
    const port = Number.parseInt(envPort);
    if (port > 1023 && port <= 65535) {
      logger.info(`Init: Config port ${port}`);
      return port;
    }
  }
  logger.error(`Illegal port number: ${envPort}. Should be between 1024 and 65535.`);
  process.exit(1);
}

function parseEnvLibraryDir(envDir: string | undefined): string {
  if (envDir !== undefined) {
    if (fs.statSync(envDir).isDirectory()) {
      logger.info(`Init: Config library dir ${envDir}`);
      return envDir;
    }
  }
  logger.error(`Library dir does not exist.`);
  process.exit(1);
}
