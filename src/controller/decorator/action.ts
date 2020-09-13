import 'reflect-metadata';
import { pushActionIndication } from './indication';

export const All = (path: string): MethodDecorator => {
  return (target, key: string | symbol): void =>
    pushActionIndication(target, { method: key, path, type: 'all' });
};
export const Get = (path: string): MethodDecorator => {
  return (target, key: string | symbol): void =>
    pushActionIndication(target, { method: key, path, type: 'get' });
};
export const Post = (path: string): MethodDecorator => {
  return (target, key: string | symbol): void =>
    pushActionIndication(target, { method: key, path, type: 'post' });
};
export const Put = (path: string): MethodDecorator => {
  return (target, key: string | symbol): void =>
    pushActionIndication(target, { method: key, path, type: 'put' });
};
export const Delete = (path: string): MethodDecorator => {
  return (target, key: string | symbol): void =>
    pushActionIndication(target, { method: key, path, type: 'delete' });
};
export const Patch = (path: string): MethodDecorator => {
  return (target, key: string | symbol): void =>
    pushActionIndication(target, { method: key, path, type: 'patch' });
};
export const Options = (path: string): MethodDecorator => {
  return (target, key: string | symbol): void =>
    pushActionIndication(target, { method: key, path, type: 'options' });
};
export const Head = (path: string): MethodDecorator => {
  return (target, key: string | symbol): void =>
    pushActionIndication(target, { method: key, path, type: 'head' });
};
