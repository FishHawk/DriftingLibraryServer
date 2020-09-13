import { pushParameterIndication } from './indication';

/* req & res */
export const Req = (): ParameterDecorator => {
  return (target, key, index): void =>
    pushParameterIndication(target, { method: key, type: 'req', index });
};
export const Res = (): ParameterDecorator => {
  return (target, key, index): void =>
    pushParameterIndication(target, { method: key, type: 'res', index });
};

/* param */
export const Param = (name: string): ParameterDecorator => {
  return (target, key, index): void =>
    pushParameterIndication(target, { method: key, type: 'param', index, name });
};
export const RawParam = (): ParameterDecorator => {
  return (target, key, index): void =>
    pushParameterIndication(target, { method: key, type: 'raw_param', index });
};

/* query */
export const Query = (name: string): ParameterDecorator => {
  return (target, key, index): void =>
    pushParameterIndication(target, { method: key, type: 'query', index, name });
};
export const RawQuery = (): ParameterDecorator => {
  return (target, key, index): void =>
    pushParameterIndication(target, { method: key, type: 'raw_query', index });
};

/* body */
export const Body = (name: string): ParameterDecorator => {
  return (target, key, index): void =>
    pushParameterIndication(target, { method: key, type: 'body', index, name });
};
export const RawBody = (): ParameterDecorator => {
  return (target, key, index): void =>
    pushParameterIndication(target, { method: key, type: 'raw_body', index });
};
