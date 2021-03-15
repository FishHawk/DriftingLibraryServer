import { ListMetadataEntry } from './helper';

/* type define */
type ActionType =
  | 'all'
  | 'get'
  | 'post'
  | 'put'
  | 'delete'
  | 'patch'
  | 'options'
  | 'head';
export interface ActionInd {
  readonly key: string | symbol;
  readonly path: string;
  readonly method: ActionType;
}
export const actionIndEntry = new ListMetadataEntry<ActionInd>('action');

/* decorators */
export const All = (path: string): MethodDecorator => {
  return (target, key: string | symbol): void =>
    actionIndEntry.push(target, { key, path, method: 'all' });
};
export const Get = (path: string): MethodDecorator => {
  return (target, key: string | symbol): void =>
    actionIndEntry.push(target, { key, path, method: 'get' });
};
export const Post = (path: string): MethodDecorator => {
  return (target, key: string | symbol): void =>
    actionIndEntry.push(target, { key, path, method: 'post' });
};
export const Put = (path: string): MethodDecorator => {
  return (target, key: string | symbol): void =>
    actionIndEntry.push(target, { key, path, method: 'put' });
};
export const Delete = (path: string): MethodDecorator => {
  return (target, key: string | symbol): void =>
    actionIndEntry.push(target, { key, path, method: 'delete' });
};
export const Patch = (path: string): MethodDecorator => {
  return (target, key: string | symbol): void =>
    actionIndEntry.push(target, { key, path, method: 'patch' });
};
export const Options = (path: string): MethodDecorator => {
  return (target, key: string | symbol): void =>
    actionIndEntry.push(target, { key, path, method: 'options' });
};
export const Head = (path: string): MethodDecorator => {
  return (target, key: string | symbol): void =>
    actionIndEntry.push(target, { key, path, method: 'head' });
};
