import { Request, Response, NextFunction } from 'express';

import {
  isBoolean,
  isNumber,
  isString,
  Sanitizer,
} from '../../util/validator/sanitizer';
import { BadRequestError } from '../exception';

import { ListMetadataEntry } from './helper';

/* type define */
export interface ParameterInd {
  readonly key: string | symbol;
  readonly index: number;
  readonly extractor: ParameterExtractor;
}
export const parameterIndEntry = new ListMetadataEntry<ParameterInd>(
  'http:parameter'
);

/* extractor */
export type ParameterExtractor = (
  req: Request,
  res: Response,
  next: NextFunction
) => any;

function extractString(obj: any, key: string): string | never {
  const value = obj[key];
  if (typeof value === 'string') return value;
  throw new BadRequestError(`illegal argument: ${key}`);
}

function extractNumber(obj: any, key: string): number | never {
  const value = obj[key];
  if (typeof value === 'string') {
    const valueInt = Number.parseInt(value);
    if (!Number.isNaN(valueInt)) return valueInt;
  }
  throw new BadRequestError(`illegal argument: ${key}`);
}

function extractBoolean(obj: any, key: string): boolean | never {
  const value = obj[key];
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  throw new BadRequestError(`illegal argument: ${key}`);
}

function extractStringArray(obj: any, key: string): string[] | never {
  const value = obj[key];
  if (Array.isArray(value)) return value;
  throw new BadRequestError(`illegal argument: ${key}`);
}

/* req */
const extractRequest = (req: Request) => req;
export const Req = (): ParameterDecorator => {
  return (target, key, index): void => {
    parameterIndEntry.push(target, { key, index, extractor: extractRequest });
  };
};

/* res */
const extractResponse = (_req: Request, res: Response) => res;
export const Res = (): ParameterDecorator => {
  return (target, key, index): void =>
    parameterIndEntry.push(target, { key, index, extractor: extractResponse });
};

/* param */
const extractParam = (req: Request) => req.params;
function buildParamExtractor(name: string, type: string): ParameterExtractor {
  if (type === 'String')
    return (req: Request) => extractString(req.params, name);
  if (type === 'Number')
    return (req: Request) => extractNumber(req.params, name);
  throw new Error('Unsupport param type');
}

export const Param = (name?: string): ParameterDecorator => {
  return (target, key, index): void => {
    let extractor;
    if (name == undefined) extractor = extractParam;
    else {
      const type = Reflect.getMetadata('design:paramtypes', target, key)[index]
        .name;
      extractor = buildParamExtractor(name, type);
    }
    parameterIndEntry.push(target, { key: key, index, extractor });
  };
};

/* query */
const extractQuery = (req: Request) => req.query;
function buildQueryExtractor(name: string, type: string): ParameterExtractor {
  if (type === 'String')
    return (req: Request) => extractString(req.query, name);
  if (type === 'Number')
    return (req: Request) => extractNumber(req.query, name);
  if (type === 'Boolean')
    return (req: Request) => extractBoolean(req.query, name);
  if (type === 'Array')
    return (req: Request) => extractStringArray(req.query, name);
  throw new Error('Unsupport query type');
}

export const Query = (name?: string): ParameterDecorator => {
  return (target, key, index): void => {
    let extractor;
    if (name == undefined) extractor = extractQuery;
    else {
      const type = Reflect.getMetadata('design:paramtypes', target, key)[index]
        .name;
      extractor = buildQueryExtractor(name, type);
    }
    parameterIndEntry.push(target, { key, index, extractor });
  };
};

/* body */
export const Body = (sanitizer?: Sanitizer<any>): ParameterDecorator => {
  return (target, key, index): void => {
    let extractor;
    if (sanitizer === undefined) extractor = (req: Request) => req.body;
    else
      extractor = (req: Request) => {
        const obj = req.body;
        if ((sanitizer as Sanitizer<any>)(obj)) return obj;
        else throw new BadRequestError(`illegal argument`);
      };

    parameterIndEntry.push(target, { key, index, extractor });
  };
};

export const BodyField = (
  name: string,
  sanitizer?: Sanitizer<any>
): ParameterDecorator => {
  return (target, key, index): void => {
    if (sanitizer === undefined) {
      const type = Reflect.getMetadata('design:paramtypes', target, key)[index]
        .name;
      if (type === 'String') sanitizer = isString();
      else if (type === 'Number') sanitizer = isNumber();
      else if (type === 'Boolean') sanitizer = isBoolean();
      else throw new Error('Unsupport body field type');
    }

    let extractor;
    if (sanitizer === undefined) extractor = (req: Request) => req.body[name];
    else
      extractor = (req: Request, res: Response) => {
        const obj = req.body[name];
        if ((sanitizer as Sanitizer<any>)(obj)) return obj;
        else throw new BadRequestError(`illegal argument: ${name}`);
      };

    parameterIndEntry.push(target, { key: key, index, extractor });
  };
};
