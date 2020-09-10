import { Request } from 'express';
import { BadRequestError } from './exception';

// TODO: require and optional

export function extractStringParam(req: Request, key: string, defaultValue?: string): string {
  const value = req.params[key];
  if (typeof value === 'string') return value;
  if (defaultValue) return defaultValue;
  throw new BadRequestError(`Illegal param: ${key}`);
}

export function extractIntParam(req: Request, key: string, defaultValue?: number): number {
  const value = req.query[key];
  if (typeof value === 'string') {
    const valueInt = Number.parseInt(value);
    if (!Number.isNaN(valueInt)) return valueInt;
  }
  if (defaultValue) return defaultValue;
  throw new BadRequestError(`Illegal param: ${key}`);
}

export function extractStringQuery(req: Request, key: string, defaultValue?: string): string {
  const value = req.query[key];
  if (typeof value === 'string') return value;
  if (defaultValue) return defaultValue;
  throw new BadRequestError(`Illegal query: ${key}`);
}

export function extractIntQuery(req: Request, key: string, defaultValue?: number): number {
  const value = req.query[key];
  if (typeof value === 'string') {
    const valueInt = Number.parseInt(value);
    if (!Number.isNaN(valueInt)) return valueInt;
  }
  if (defaultValue) return defaultValue;
  throw new BadRequestError(`Illegal query: ${key}`);
}
