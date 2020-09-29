type GuardType<T> = T extends Sanitizer<infer U> ? U : never;
type UToI<T> = (T extends any ? (k: T) => void : never) extends (k: infer U) => void ? U : never;

export type Sanitizer<T> = (value: unknown) => value is T;

export function isUndefined(): Sanitizer<undefined> {
  return (value: unknown): value is undefined => {
    if (typeof value === 'undefined') return true;
    else return false;
  };
}

export function isNull(): Sanitizer<null> {
  return (value: unknown): value is null => {
    if (value === null) return true;
    else return false;
  };
}

export function isString(): Sanitizer<string> {
  return (value: unknown): value is string => {
    if (typeof value === 'string') return true;
    else return false;
  };
}

export function isNumber(): Sanitizer<number> {
  return (value: unknown): value is number => {
    if (typeof value === 'number') return true;
    else return false;
  };
}

export function isBoolean(): Sanitizer<boolean> {
  return (value: unknown): value is boolean => {
    if (typeof value === 'boolean') return true;
    else return false;
  };
}

export function isArray<T>(subSanitizer: Sanitizer<T>): Sanitizer<T[]> {
  return (value: unknown): value is T[] => {
    if (Array.isArray(value)) return value.every(subSanitizer);
    else return false;
  };
}

type Scheme<T extends object> = { [P in keyof T]: Sanitizer<T[P]> };
export function isObject<T extends object>(scheme: Scheme<T>, strictMode: boolean = false) {
  return (value: unknown): value is T => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;

    // sanitize property by scheme
    for (const key in scheme) {
      const sanitize: Scheme<T>[keyof T] = scheme[key];
      const prop: unknown = (value as any)[key];
      if (!sanitize(prop)) return false;
    }

    // excess property check
    if (strictMode) {
      for (const key in value) {
        if (!(key in scheme) && (value as any)[key] !== undefined) return false;
      }
    }

    return true;
  };
}

export function union<T extends Sanitizer<any>>(sanitizers: T[]): Sanitizer<GuardType<T>> {
  return (value: unknown): value is GuardType<T> => {
    for (const sanitizer of sanitizers) {
      if (sanitizer(value)) return true;
    }
    return false;
  };
}

export function intersection<T extends Sanitizer<any>>(
  sanitizers: T[]
): Sanitizer<UToI<GuardType<T>>> {
  return (value: unknown): value is UToI<GuardType<T>> => {
    for (const sanitizer of sanitizers) {
      if (!sanitizer(value)) return false;
    }
    return true;
  };
}
