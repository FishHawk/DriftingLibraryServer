import 'reflect-metadata';
import { RequestHandler } from 'express';

type RequestType = 'all' | 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head';

class RouteIndication {
  constructor(
    readonly path: string,
    readonly type: RequestType,
    readonly method: string | symbol
  ) {}
  useBefore: RequestHandler[] = [];
  useAfter: RequestHandler[] = [];
}

type ControllerMetadata = {
  [P in string | symbol]: RouteIndication;
};

export function getControllerMetadata(target: Object): ControllerMetadata {
  if (!Reflect.hasMetadata('meta', target.constructor)) {
    Reflect.defineMetadata('meta', {}, target.constructor);
  }
  return Reflect.getMetadata('meta', target.constructor);
}

/* Use before or after */
export const UseBefore = (...middlewares: RequestHandler[]): MethodDecorator => {
  return (target, propertyKey: string | symbol): void => {
    const key = (propertyKey as unknown) as string;
    const ind = getControllerMetadata(target)[key];
    ind?.useBefore.push(...middlewares);
  };
};

export const UseAfter = (...middlewares: RequestHandler[]): MethodDecorator => {
  return (target, propertyKey: string | symbol): void => {
    const key = (propertyKey as unknown) as string;
    const ind = getControllerMetadata(target)[key];
    ind?.useAfter.push(...middlewares);
  };
};

/* Method */
function registMethod(
  type: RequestType,
  path: string,
  target: Object,
  propertyKey: string | symbol
): void {
  const key = (propertyKey as unknown) as string;
  getControllerMetadata(target)[key] = new RouteIndication(path, type, propertyKey);
}

export const All = (path: string): MethodDecorator => {
  return (target, propertyKey: string | symbol): void =>
    registMethod('all', path, target, propertyKey);
};
export const Get = (path: string): MethodDecorator => {
  return (target, propertyKey: string | symbol): void =>
    registMethod('get', path, target, propertyKey);
};
export const Post = (path: string): MethodDecorator => {
  return (target, propertyKey: string | symbol): void =>
    registMethod('post', path, target, propertyKey);
};
export const Put = (path: string): MethodDecorator => {
  return (target, propertyKey: string | symbol): void =>
    registMethod('put', path, target, propertyKey);
};
export const Delete = (path: string): MethodDecorator => {
  return (target, propertyKey: string | symbol): void =>
    registMethod('delete', path, target, propertyKey);
};
export const Patch = (path: string): MethodDecorator => {
  return (target, propertyKey: string | symbol): void =>
    registMethod('patch', path, target, propertyKey);
};
export const Options = (path: string): MethodDecorator => {
  return (target, propertyKey: string | symbol): void =>
    registMethod('options', path, target, propertyKey);
};
export const Head = (path: string): MethodDecorator => {
  return (target, propertyKey: string | symbol): void =>
    registMethod('head', path, target, propertyKey);
};
