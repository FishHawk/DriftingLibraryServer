import 'reflect-metadata';
import { RequestHandler } from 'express';
import { pushMiddlewareIndication } from './indication';

export const UseBefore = (...middlewares: RequestHandler[]): MethodDecorator => {
  return (target, key: string | symbol): void =>
    pushMiddlewareIndication(target, { method: key, useBefore: middlewares, useAfter: [] });
};

export const UseAfter = (...middlewares: RequestHandler[]): MethodDecorator => {
  return (target, key: string | symbol): void =>
    pushMiddlewareIndication(target, { method: key, useBefore: [], useAfter: middlewares });
};
