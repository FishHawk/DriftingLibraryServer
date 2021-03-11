import { RequestHandler } from 'express';
import { ActionInd, getActionIndication } from './action';
import { getMiddlewareIndication } from './middleware';
import { getParameterIndication, ParameterExtractor } from './param';

export type MergedInd = ActionInd & {
  readonly useBefore: RequestHandler[];
  readonly useAfter: RequestHandler[];
  readonly extractors: ParameterExtractor[];
};

export function getMergedIndications(target: Object): MergedInd[] {
  const actionIndList = getActionIndication(target);
  const middlewareIndList = getMiddlewareIndication(target);

  return actionIndList.map((indA) => {
    const ind: MergedInd = {
      ...indA,
      useBefore: middlewareIndList
        .filter((indM) => indM.key === indA.key && indM.type === 'before')
        .map((indM) => indM.middleware),
      useAfter: middlewareIndList
        .filter((indM) => indM.key === indA.key && indM.type === 'after')
        .map((indM) => indM.middleware),
      extractors: getParameterIndication(target)
        .filter((it) => it.key == indA.key)
        .sort((a, b) => a.index - b.index)
        .map((it, index) => {
          if (it.index !== index)
            throw new Error(
              `Parameter decorator not match at ${indA.key as string}:${index}`
            );
          return it.extractor;
        }),
    };

    const paramSize = (Reflect.getMetadata(
      'design:paramtypes',
      target,
      indA.key
    ) as Function[]).length;

    if (ind.extractors.length !== paramSize)
      throw new Error(`Parameter decorator not match at ${indA.key as string}`);

    return ind;
  });
}
