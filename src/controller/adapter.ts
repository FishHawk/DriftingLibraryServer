import {
  Router,
  Request,
  Response,
  NextFunction,
  RequestHandler,
  Application,
} from 'express';
import { controllerIndEntry } from './decorator/controller';

import { ParameterExtractor } from './decorator/parameter';

export abstract class ControllerAdapter {
  protected readonly router = Router();

  constructor() {
    const cInd = controllerIndEntry.get(this);
    cInd.methods.forEach((ind) => {
      this.router[ind.verb](
        ind.path,
        ...ind.useBefore,
        this.wrap(ind.key, ind.extractors),
        ...ind.useAfter
      );
    });
  }

  bind(app: Application) {
    const cInd = controllerIndEntry.get(this);
    app.use(cInd.prefix, this.router);
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
