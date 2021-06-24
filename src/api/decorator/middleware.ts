import { RequestHandler } from 'express';

import { ListMetadataEntry } from './helper';

/* type define */
type MiddlewareType = 'before' | 'after';
interface MiddlewareInd {
  readonly key: string | symbol;
  readonly type: MiddlewareType;
  readonly middleware: RequestHandler;
}
export const middlewareIndEntry = new ListMetadataEntry<MiddlewareInd>(
  'http:middleware'
);

/* decorators */
export const UseBefore = (middleware: RequestHandler): MethodDecorator => {
  return (target, key): void =>
    middlewareIndEntry.push(target, { key, type: 'before', middleware });
};

export const UseAfter = (middleware: RequestHandler): MethodDecorator => {
  return (target, key): void =>
    middlewareIndEntry.push(target, { key, type: 'after', middleware });
};
