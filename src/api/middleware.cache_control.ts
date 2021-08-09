import { Request, Response, NextFunction, RequestHandler } from 'express';

export function cacheControl(minute: number): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const period = Math.round(minute * 60);
    res.set('Cache-control', `public, max-age=${period}`);
    next();
  };
}