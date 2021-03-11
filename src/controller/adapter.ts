import {
  Router,
  Request,
  Response,
  NextFunction,
  RequestHandler,
  Application,
} from 'express';

import { getMergedIndications } from './decorator/merged';
import { ParameterExtractor } from './decorator/param';

export abstract class ControllerAdapter {
  protected abstract readonly prefix: string;
  protected readonly router = Router();

  constructor() {
    const target = Object.getPrototypeOf(this);
    getMergedIndications(target).forEach((ind) => {
      const middlewares = [
        ...ind.useBefore,
        this.wrap(ind.method, ind.extractors),
        ...ind.useAfter,
      ];
      this.router[ind.type](ind.path, ...middlewares);
    });
  }

  bind(app: Application) {
    app.use(this.prefix, this.router);
  }

  private wrap = (
    method: string | symbol,
    extractors: ParameterExtractor[]
  ): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
      const params = extractors.map((extract) => extract(req, res, next));
      const func: Function = (this as any)[method];
      Promise.resolve(func.call(this, ...params)).catch(next);
    };
  };
}
