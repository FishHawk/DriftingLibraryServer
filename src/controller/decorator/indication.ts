import { RequestHandler } from 'express';

function getIndications<T>(target: Object, key: any): T[] {
  if (!Reflect.hasMetadata(key, target.constructor)) {
    Reflect.defineMetadata(key, [], target.constructor);
  }
  return Reflect.getMetadata(key, target.constructor);
}

function pushIndication<T>(target: Object, key: any, ind: T) {
  if (!Reflect.hasMetadata(key, target.constructor)) {
    Reflect.defineMetadata(key, [], target.constructor);
  }
  const list: T[] = Reflect.getMetadata(key, target.constructor);
  list.push(ind);
}

/* action indication */
type ActionType = 'all' | 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head';
interface ActionIndication {
  readonly method: string | symbol;
  readonly path: string;
  readonly type: ActionType;
}

const IND_KEY_ACTION = 'action';
export function pushActionIndication(target: Object, ind: ActionIndication) {
  pushIndication(target, IND_KEY_ACTION, ind);
}

/* middleware indication */
type MiddlewareType = 'before' | 'after';
interface MiddlewareIndication {
  readonly method: string | symbol;
  readonly type: MiddlewareType;
  readonly middleware: RequestHandler;
}

const IND_KEY_MIDDLEWARE = 'middleware';
export function pushMiddlewareIndication(target: Object, ind: MiddlewareIndication) {
  pushIndication(target, IND_KEY_MIDDLEWARE, ind);
}

/* parameter indication */
type ParameterType =
  | 'req'
  | 'res'
  | 'param'
  | 'query'
  | 'body'
  | 'raw_param'
  | 'raw_query'
  | 'raw_body';
interface ParameterIndication {
  readonly method: string | symbol;
  readonly type: ParameterType;
  readonly index: number;
  readonly name?: string;
}

const IND_KEY_PARAMETER = 'parameter';
export function pushParameterIndication(target: Object, ind: ParameterIndication) {
  pushIndication(target, IND_KEY_PARAMETER, ind);
}

/* merged indication */
type MergedIndication = ActionIndication & {
  useBefore: RequestHandler[];
  useAfter: RequestHandler[];
  params: ParameterIndication[];
};

export function getMergedIndications(target: Object): MergedIndication[] {
  const actionIndList: ActionIndication[] = getIndications(target, IND_KEY_ACTION);
  const middlewareIndList: MiddlewareIndication[] = getIndications(target, IND_KEY_MIDDLEWARE);
  const parameterIndList: ParameterIndication[] = getIndications(target, IND_KEY_PARAMETER);

  return actionIndList.map((indA) => {
    const ind: MergedIndication = {
      ...indA,
      useBefore: middlewareIndList
        .filter((indM) => indM.method === indA.method && indM.type === 'before')
        .map((indM) => indM.middleware),
      useAfter: middlewareIndList
        .filter((indM) => indM.method === indA.method && indM.type === 'after')
        .map((indM) => indM.middleware),
      params: parameterIndList
        .filter((indP) => indP.method === indA.method)
        .sort((a, b) => a.index - b.index),
    };
    return ind;
  });
}
