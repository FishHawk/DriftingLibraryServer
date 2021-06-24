import fs from 'fs';
import dotenv from 'dotenv';

import logger from '@logger';

/* read dotenv file */
dotenv.config();

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

interface Config {
  readonly app: {
    readonly libraryDir: string;
    readonly port: number;
  };

  downloader: { concurrent: number };
  bilibili: { cookie: string | undefined };
}

let config: Config = {
  app: {
    libraryDir: parseEnvLibraryDir(process.env.LIBRARY_DIR),
    port: parseEnvPort(process.env.PORT),
  },
  downloader: { concurrent: 5 },
  bilibili: { cookie: undefined },
};

export default config;
