import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../exception';

import { getIndications, pushIndication } from './indication';

/* type define */
export interface ParameterInd {
  readonly method: string | symbol;
  readonly index: number;
  readonly extractor: ParameterExtractor;
}

export const IND_KEY_PARAMETER = 'parameter';
export function getParameterIndication(target: Object) {
  return getIndications<ParameterInd>(target, IND_KEY_PARAMETER);
}
function pushParameterIndication(target: Object, ind: ParameterInd) {
  pushIndication(target, IND_KEY_PARAMETER, ind);
}

/* extractor */
export type ParameterExtractor = (
  req: Request,
  res: Response,
  next: NextFunction
) => any;

const extractRequest = (req: Request) => req;
const extractResponse = (_req: Request, res: Response) => res;
const extractParamRaw = (req: Request) => req.params;
const extractQueryRaw = (req: Request) => req.query;
const extractBodyRaw = (req: Request) => req.body;

function extractParam(name: string, type: string): ParameterExtractor {
  if (type === 'String')
    return (req: Request) => extractString(req.params, name);
  if (type === 'Number')
    return (req: Request) => extractNumber(req.params, name);
  throw new Error('unsupport parameter type');
}

function extractQuery(name: string, type: string): ParameterExtractor {
  if (type === 'String')
    return (req: Request) => extractString(req.query, name);
  if (type === 'Number')
    return (req: Request) => extractNumber(req.query, name);
  throw new Error('unsupport parameter type');
}

function extractBody(name: string, type: string): ParameterExtractor {
  if (type === 'String') return (req: Request) => extractString(req.body, name);
  if (type === 'Number') return (req: Request) => extractNumber(req.body, name);
  if (type === 'Array') return (req: Request) => extractArray(req.body, name);
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

function extractArray(obj: any, key: string): string[] | undefined {
  const value = obj[key];
  if (Array.isArray(value)) return value;
  throw new BadRequestError(`illegal argument: ${key}`);
}

/* req & res */
export const Req = (): ParameterDecorator => {
  return (target, key, index): void => {
    pushParameterIndication(target, {
      method: key,
      index,
      extractor: extractRequest,
    });
  };
};

export const Res = (): ParameterDecorator => {
  return (target, key, index): void =>
    pushParameterIndication(target, {
      method: key,
      index,
      extractor: extractResponse,
    });
};

/* param */
export const Param = (name?: string): ParameterDecorator => {
  return (target, key, index): void => {
    let extractor;
    if (name == undefined) extractor = extractParamRaw;
    else {
      const type: Function = Reflect.getMetadata(
        'design:paramtypes',
        target,
        key
      )[index];
      extractor = extractParam(name, type.name);
    }
    pushParameterIndication(target, { method: key, index, extractor });
  };
};

/* query */
export const Query = (name?: string): ParameterDecorator => {
  return (target, key, index): void => {
    let extractor;
    if (name == undefined) extractor = extractQueryRaw;
    else {
      const type: Function = Reflect.getMetadata(
        'design:paramtypes',
        target,
        key
      )[index];
      extractor = extractQuery(name, type.name);
    }
    pushParameterIndication(target, { method: key, index, extractor });
  };
};

/* body */
export const Body = (name?: string): ParameterDecorator => {
  return (target, key, index): void => {
    let extractor;
    if (name == undefined) extractor = extractBodyRaw;
    else {
      const type: Function = Reflect.getMetadata(
        'design:paramtypes',
        target,
        key
      )[index];
      extractor = extractBody(name, type.name);
    }
    pushParameterIndication(target, { method: key, index, extractor });
  };
};
