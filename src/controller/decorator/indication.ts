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
interface MiddlewareIndication {
  readonly method: string | symbol;
  readonly useBefore: RequestHandler[];
  readonly useAfter: RequestHandler[];
}

const IND_KEY_MIDDLEWARE = 'middleware';
export function pushMiddlewareIndication(target: Object, ind: MiddlewareIndication) {
  pushIndication(target, IND_KEY_MIDDLEWARE, ind);
}

/* merged indication */
type MergedIndication = ActionIndication & MiddlewareIndication;

export function getMergedIndications(target: Object): MergedIndication[] {
  const actionIndList: ActionIndication[] = getIndications(target, IND_KEY_ACTION);
  const middlewareIndList: MiddlewareIndication[] = getIndications(target, IND_KEY_MIDDLEWARE);

  return actionIndList.map((actionInd) => {
    const ind: MergedIndication = {
      ...actionInd,
      useBefore: [],
      useAfter: [],
    };

    middlewareIndList
      .filter((indM) => indM.method === ind.method)
      .map((indM) => {
        ind.useBefore.push(...indM.useBefore);
        ind.useAfter.push(...indM.useAfter);
      });

    return ind;
  });
}
