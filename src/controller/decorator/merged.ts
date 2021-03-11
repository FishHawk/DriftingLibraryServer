import { RequestHandler } from 'express';
import { ActionInd, getActionIndication } from './action';
import { getMiddlewareIndication } from './middleware';

export type MergedInd = ActionInd & {
  useBefore: RequestHandler[];
  useAfter: RequestHandler[];
};

export function getMergedIndications(target: Object): MergedInd[] {
  const actionIndList = getActionIndication(target);
  const middlewareIndList = getMiddlewareIndication(target);

  return actionIndList.map((indA) => {
    const ind: MergedInd = {
      ...indA,
      useBefore: middlewareIndList
        .filter((indM) => indM.method === indA.method && indM.type === 'before')
        .map((indM) => indM.middleware),
      useAfter: middlewareIndList
        .filter((indM) => indM.method === indA.method && indM.type === 'after')
        .map((indM) => indM.middleware),
    };
    return ind;
  });
}
