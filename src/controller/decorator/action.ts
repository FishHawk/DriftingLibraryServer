import { getIndications, pushIndication } from './indication';

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

const IND_KEY_ACTION = 'action';
export function getActionIndication(target: Object) {
  return getIndications<ActionInd>(target, IND_KEY_ACTION);
}
function pushActionIndication(target: Object, ind: ActionInd) {
  pushIndication(target, IND_KEY_ACTION, ind);
}

/* decorators */
export const All = (path: string): MethodDecorator => {
  return (target, key: string | symbol): void =>
    pushActionIndication(target, { key, path, method: 'all' });
};
export const Get = (path: string): MethodDecorator => {
  return (target, key: string | symbol): void =>
    pushActionIndication(target, { key, path, method: 'get' });
};
export const Post = (path: string): MethodDecorator => {
  return (target, key: string | symbol): void =>
    pushActionIndication(target, { key, path, method: 'post' });
};
export const Put = (path: string): MethodDecorator => {
  return (target, key: string | symbol): void =>
    pushActionIndication(target, { key, path, method: 'put' });
};
export const Delete = (path: string): MethodDecorator => {
  return (target, key: string | symbol): void =>
    pushActionIndication(target, { key, path, method: 'delete' });
};
export const Patch = (path: string): MethodDecorator => {
  return (target, key: string | symbol): void =>
    pushActionIndication(target, { key, path, method: 'patch' });
};
export const Options = (path: string): MethodDecorator => {
  return (target, key: string | symbol): void =>
    pushActionIndication(target, { key, path, method: 'options' });
};
export const Head = (path: string): MethodDecorator => {
  return (target, key: string | symbol): void =>
    pushActionIndication(target, { key, path, method: 'head' });
};
