import { Request } from 'express';
import { BadRequestError } from '../exception';

// TODO: replace with decorator

export function getStringParam(req: Request, key: string, defaultValue?: string): string {
  const value = req.params[key];
  if (typeof value === 'string') return value;
  if (defaultValue) return defaultValue;
  throw new BadRequestError(`Illegal param: ${key}`);
}

export function getIntParam(req: Request, key: string, defaultValue?: number): number {
  const value = req.query[key];
  if (typeof value === 'string') {
    const valueInt = Number.parseInt(value);
    if (!Number.isNaN(valueInt)) return valueInt;
  }
  if (defaultValue) return defaultValue;
  throw new BadRequestError(`Illegal param: ${key}`);
}

export function getStringQuery(req: Request, key: string, defaultValue?: string): string {
  const value = req.query[key];
  if (typeof value === 'string') return value;
  if (defaultValue) return defaultValue;
  throw new BadRequestError(`Illegal query: ${key}`);
}

export function getIntQuery(req: Request, key: string, defaultValue?: number): number {
  const value = req.query[key];
  if (typeof value === 'string') {
    const valueInt = Number.parseInt(value);
    if (!Number.isNaN(valueInt)) return valueInt;
  }
  if (defaultValue) return defaultValue;
  throw new BadRequestError(`Illegal query: ${key}`);
}

export function getStringBodyField(req: Request, key: string, defaultValue?: string): string {
  const value = req.body[key];
  if (typeof value === 'string') return value;
  if (defaultValue) return defaultValue;
  throw new BadRequestError(`Illegal query: ${key}`);
}

export function getIntBodyField(req: Request, key: string, defaultValue?: number): number {
  const value = req.body[key];
  if (typeof value === 'string') {
    const valueInt = Number.parseInt(value);
    if (!Number.isNaN(valueInt)) return valueInt;
  }
  if (defaultValue) return defaultValue;
  throw new BadRequestError(`Illegal query: ${key}`);
}
