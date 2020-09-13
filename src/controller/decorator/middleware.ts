import 'reflect-metadata';
import { RequestHandler } from 'express';
import { pushMiddlewareIndication } from './indication';

export const UseBefore = (middleware: RequestHandler): MethodDecorator => {
  return (target, key: string | symbol): void =>
    pushMiddlewareIndication(target, { method: key, type: 'before', middleware });
};

export const UseAfter = (middleware: RequestHandler): MethodDecorator => {
  return (target, key: string | symbol): void =>
    pushMiddlewareIndication(target, { method: key, type: 'after', middleware });
};
