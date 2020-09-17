import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger';
import { HttpError } from './exception';

export const errorHandleMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof HttpError) {
    logger.info(`Http error: ${err.status} ${err.message}`);
    res.status(err.status).send(err.message);
  } else {
    logger.error(err);
    res.status(500).send('Unexceped error.');
  }
};
