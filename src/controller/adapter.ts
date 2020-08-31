import { Router, Request, Response, NextFunction, RequestHandler } from 'express';

export abstract class ControllerAdapter {
  readonly router = Router();

  wrap(callback: RequestHandler): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
      callback(req, res, next).catch(next);
    };
  }


}
