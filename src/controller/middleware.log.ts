import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger';

export const logMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  logger.info(`Request: ${req.method} ${req.url}`);
  next();
};
