import { Request, Response, NextFunction } from 'express';

export const cacheControlMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.method == 'GET') {
    const period = 60 * 30;
    res.set('Cache-control', `public, max-age=${period}`);
  } else {
    res.set('Cache-control', `no-store`);
  }
  next();
};
