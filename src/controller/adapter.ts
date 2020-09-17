import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { BadRequestError } from './exception';
import { getMergedIndications } from './decorator/indication';

export abstract class ControllerAdapter {
  readonly router = Router();

  constructor() {
    const target = Object.getPrototypeOf(this);
    getMergedIndications(target).forEach((ind) => {
      const paramtypes: Function[] = Reflect.getMetadata('design:paramtypes', target, ind.method);
      if (paramtypes.length !== ind.params.length)
        throw new Error(`unmatched parameter length of ${ind.method as string}`);

      const extractors: ParameterExtractor[] = paramtypes.map((paramtype, index) => {
        const indP = ind.params[index];
        if (index !== indP.index)
          throw new Error(`unmatched parameter index of ${ind.method as string}`);
        if (indP.type === 'req') return extractRequest;
        if (indP.type === 'res') return extractResponse;
        if (indP.type === 'raw_param') return extractParamRaw;
        if (indP.type === 'raw_query') return extractQueryRaw;
        if (indP.type === 'raw_body') return extractBodyRaw;

        if (indP.name === undefined) throw new Error('param name not found');
        if (indP.type === 'param') return extractParam(indP.name, paramtype.name);
        if (indP.type === 'query') return extractQuery(indP.name, paramtype.name);
        if (indP.type === 'body') return extractBody(indP.name, paramtype.name);

        throw new Error('unknown parameter indication type');
      });

      const middlewares = [...ind.useBefore, this.wrap(ind.method, extractors), ...ind.useAfter];
      this.router[ind.type](ind.path, ...middlewares);
    });
  }

  private wrap = (method: string | symbol, extractors: ParameterExtractor[]): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
      const params = extractors.map((extract) => extract(req, res, next));
      const func: Function = (this as any)[method];
      Promise.resolve(func.call(this, ...params)).catch(next);
    };
  };
}

/* parameter extractor helper */
type ParameterExtractor = (req: Request, res: Response, next: NextFunction) => any;
const extractRequest = (req: Request) => req;
const extractResponse = (_req: Request, res: Response) => res;
const extractParamRaw = (req: Request) => req.params;
const extractQueryRaw = (req: Request) => req.query;
const extractBodyRaw = (req: Request) => req.body;

function extractParam(name: string, type: string): ParameterExtractor {
  if (type === 'String') return (req: Request) => extractString(req.params, name);
  if (type === 'Number') return (req: Request) => extractNumber(req.params, name);
  throw new Error('unsupport parameter type');
}

function extractQuery(name: string, type: string): ParameterExtractor {
  if (type === 'String') return (req: Request) => extractString(req.query, name);
  if (type === 'Number') return (req: Request) => extractNumber(req.query, name);
  throw new Error('unsupport parameter type');
}

function extractBody(name: string, type: string): ParameterExtractor {
  if (type === 'String') return (req: Request) => extractString(req.body, name);
  if (type === 'Number') return (req: Request) => extractNumber(req.body, name);
  throw new Error('unsupport parameter type');
}

function extractString(obj: any, key: string): string | undefined {
  const value = obj[key];
  if (typeof value === 'string') return value;
  throw new BadRequestError(`illegal argument: ${key}`);
}

function extractNumber(obj: any, key: string): number | undefined {
  const value = obj[key];
  if (typeof value === 'string') {
    const valueInt = Number.parseInt(value);
    if (!Number.isNaN(valueInt)) return valueInt;
  }
  throw new BadRequestError(`illegal argument: ${key}`);
}
