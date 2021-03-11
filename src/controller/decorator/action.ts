import { getIndications, pushIndication } from './indication';
import { getParameterIndication, ParameterExtractor } from './param';

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
  readonly method: string | symbol;
  readonly path: string;
  readonly type: ActionType;
  readonly extractors: ParameterExtractor[];
}

const IND_KEY_ACTION = 'action';
export function getActionIndication(target: Object) {
  return getIndications<ActionInd>(target, IND_KEY_ACTION);
}
function pushActionIndication(
  target: Object,
  key: string | symbol,
  path: string,
  type: ActionType
) {
  const extractors = getParameterIndication(target)
    .filter((it) => it.method == key)
    .sort((a, b) => a.index - b.index)
    .map((it) => it.extractor);
  const paramSize = (Reflect.getMetadata(
    'design:paramtypes',
    target,
    key
  ) as Function[]).length;

  if (extractors.length !== paramSize)
    throw new Error(`unmatched parameter length of ${key as string}`);

  const ind: ActionInd = { method: key, path, type, extractors };
  pushIndication(target, IND_KEY_ACTION, ind);
}

/* annotation */
export const All = (path: string): MethodDecorator => {
  return (target, key: string | symbol): void =>
    pushActionIndication(target, key, path, 'all');
};
export const Get = (path: string): MethodDecorator => {
  return (target, key: string | symbol): void =>
    pushActionIndication(target, key, path, 'get');
};
export const Post = (path: string): MethodDecorator => {
  return (target, key: string | symbol): void =>
    pushActionIndication(target, key, path, 'post');
};
export const Put = (path: string): MethodDecorator => {
  return (target, key: string | symbol): void =>
    pushActionIndication(target, key, path, 'put');
};
export const Delete = (path: string): MethodDecorator => {
  return (target, key: string | symbol): void =>
    pushActionIndication(target, key, path, 'delete');
};
export const Patch = (path: string): MethodDecorator => {
  return (target, key: string | symbol): void =>
    pushActionIndication(target, key, path, 'patch');
};
export const Options = (path: string): MethodDecorator => {
  return (target, key: string | symbol): void =>
    pushActionIndication(target, key, path, 'options');
};
export const Head = (path: string): MethodDecorator => {
  return (target, key: string | symbol): void =>
    pushActionIndication(target, key, path, 'head');
};
