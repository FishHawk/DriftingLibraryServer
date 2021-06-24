import { Request, Response, NextFunction } from 'express';
import logger from '@logger';
import { HttpError } from '@service/exception';

export const errorHandleMiddleware = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof HttpError) {
    logger.info(`Http error: ${err.status} ${err.message}`);
    res.status(err.status).send(err.message);
  } else {
    logger.error(`Unexpected error: ${err.stack}`);
    res.status(500).send('Unexpected error.');
  }
};
