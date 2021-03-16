import { ListMetadataEntry } from './helper';

/* type define */
type VerbType =
  | 'all'
  | 'get'
  | 'post'
  | 'put'
  | 'delete'
  | 'patch'
  | 'options'
  | 'head';
export interface VerbInd {
  readonly key: string | symbol;
  readonly path: string;
  readonly verb: VerbType;
}
export const methodIndEntry = new ListMetadataEntry<VerbInd>('http:verb');

/* decorators */
export const All = (path: string): MethodDecorator => {
  return (target, key): void =>
    methodIndEntry.push(target, { key, path, verb: 'all' });
};
export const Get = (path: string): MethodDecorator => {
  return (target, key): void =>
    methodIndEntry.push(target, { key, path, verb: 'get' });
};
export const Post = (path: string): MethodDecorator => {
  return (target, key): void =>
    methodIndEntry.push(target, { key, path, verb: 'post' });
};
export const Put = (path: string): MethodDecorator => {
  return (target, key): void =>
    methodIndEntry.push(target, { key, path, verb: 'put' });
};
export const Delete = (path: string): MethodDecorator => {
  return (target, key): void =>
    methodIndEntry.push(target, { key, path, verb: 'delete' });
};
export const Patch = (path: string): MethodDecorator => {
  return (target, key): void =>
    methodIndEntry.push(target, { key, path, verb: 'patch' });
};
export const Options = (path: string): MethodDecorator => {
  return (target, key): void =>
    methodIndEntry.push(target, { key, path, verb: 'options' });
};
export const Head = (path: string): MethodDecorator => {
  return (target, key): void =>
    methodIndEntry.push(target, { key, path, verb: 'head' });
};
