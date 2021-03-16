import { RequestHandler } from 'express';

import { MetadataEntry } from './helper';
import { middlewareIndEntry } from './middleware';
import { ParameterExtractor, parameterIndEntry } from './parameter';
import { VerbInd, methodIndEntry } from './verb';

/* type define */
type MergedInd = VerbInd & {
  readonly useBefore: RequestHandler[];
  readonly useAfter: RequestHandler[];
  readonly extractors: ParameterExtractor[];
};

interface ControllerInd {
  readonly prefix: string;
  readonly methods: MergedInd[];
}
export const controllerIndEntry = new MetadataEntry<ControllerInd>(
  'http:controller'
);

/* decorators */
export const Controller = (prefix: string): ClassDecorator => {
  return (target): void => {
    target = target.prototype;
    const actionIndList = methodIndEntry.get(target, []);
    const middlewareIndList = middlewareIndEntry.get(target, []);

    const methods = actionIndList.map((indV) => {
      const ind: MergedInd = {
        ...indV,
        useBefore: middlewareIndList
          .filter((indM) => indM.key === indV.key && indM.type === 'before')
          .map((indM) => indM.middleware),
        useAfter: middlewareIndList
          .filter((indM) => indM.key === indV.key && indM.type === 'after')
          .map((indM) => indM.middleware),
        extractors: parameterIndEntry
          .get(target, [])
          .filter((it) => it.key == indV.key)
          .sort((a, b) => a.index - b.index)
          .map((indP, index) => {
            if (indP.index !== index)
              throw new Error(
                `Parameter decorator not match at ${
                  indV.key as string
                }:${index}`
              );
            return indP.extractor;
          }),
      };

      const paramSize = (Reflect.getMetadata(
        'design:paramtypes',
        target,
        indV.key
      ) as Function[]).length;

      if (ind.extractors.length !== paramSize)
        throw new Error(
          `Parameter decorator not match at ${indV.key as string}`
        );

      return ind;
    });
    controllerIndEntry.set(target, { prefix, methods });
  };
};
