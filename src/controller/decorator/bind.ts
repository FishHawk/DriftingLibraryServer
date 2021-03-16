import {
  RequestHandler,
  Request,
  Response,
  Router,
  NextFunction,
  Application,
} from 'express';

import { controllerIndEntry } from './controller';
import { ParameterExtractor } from './parameter';

export function bind(app: Application, target: Object) {
  const router = Router();
  const cInd = controllerIndEntry.get(target);
  cInd.methods.forEach((ind) => {
    router[ind.verb](
      ind.path,
      ...ind.useBefore,
      wrap(target, ind.key, ind.extractors),
      ...ind.useAfter
    );
  });
  app.use(cInd.prefix, router);
}

const wrap = (
  target: any,
  method: string | symbol,
  extractors: ParameterExtractor[]
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    const params = extractors.map((extract) => extract(req, res, next));
    const func: Function = target[method];
    Promise.resolve(func.call(target, ...params)).catch(next);
  };
};
