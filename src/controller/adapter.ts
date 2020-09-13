import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { getMergedIndications } from './decorator/indication';

export abstract class ControllerAdapter {
  readonly router = Router();

  constructor() {
    const target = Object.getPrototypeOf(this);
    getMergedIndications(target).forEach((ind) => {
      console.log(ind);
      const middlewares = [...ind.useBefore, this.wrap(ind.method), ...ind.useAfter];
      this.router[ind.type](ind.path, ...middlewares);
    });
  }

  wrap = (method: string | symbol): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
      (this as any)[method](req, res, next).catch(next);
    };
  };
}
