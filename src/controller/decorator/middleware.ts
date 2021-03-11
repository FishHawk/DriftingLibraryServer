import { RequestHandler } from 'express';

import { getIndications, pushIndication } from './indication';

/* type define */
type MiddlewareType = 'before' | 'after';
export interface MiddlewareInd {
  readonly method: string | symbol;
  readonly type: MiddlewareType;
  readonly middleware: RequestHandler;
}

const IND_KEY_MIDDLEWARE = 'middleware';
export function getMiddlewareIndication(target: Object) {
  return getIndications<MiddlewareInd>(target, IND_KEY_MIDDLEWARE);
}
function pushMiddlewareIndication(target: Object, ind: MiddlewareInd) {
  pushIndication(target, IND_KEY_MIDDLEWARE, ind);
}

/* annotation */
export const UseBefore = (middleware: RequestHandler): MethodDecorator => {
  return (target, key: string | symbol): void =>
    pushMiddlewareIndication(target, {
      method: key,
      type: 'before',
      middleware,
    });
};

export const UseAfter = (middleware: RequestHandler): MethodDecorator => {
  return (target, key: string | symbol): void =>
    pushMiddlewareIndication(target, {
      method: key,
      type: 'after',
      middleware,
    });
};
