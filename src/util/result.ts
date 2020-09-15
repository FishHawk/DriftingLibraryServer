export const ResultType = {
  Ok: Symbol(':ok'),
  Fail: Symbol(':fail'),
};

export interface When<T, F, U> {
  ok: (val: T) => U;
  fail: (val: F) => U;
}

export abstract class Result<T, F> {
  abstract type: symbol;
  abstract isOk(): this is Ok<T, never>;
  abstract isFail(): this is Fail<never, F>;
  abstract extract(): T | F;

  abstract when<U>(fn: When<T, F, U>): U;
  abstract whenOk<U>(fn: (val: T) => U): U | F;
  abstract whenFail<U>(fn: (err: F) => U): U | T;

  abstract map<T2>(fn: (val: T) => T2): Result<T2, F>;
  abstract mapFail<F2>(fn: (fail: F) => F2): Result<T, F2>;
  abstract andThen<T2>(fn: (val: T) => Result<T2, F>): Result<T2, F>;
  abstract orElse<F2>(fn: (fail: F) => Result<T, F2>): Result<T, F2>;
}

export function ok<T>(val: T): Ok<T, never>;
export function ok(): Ok<undefined, never>;
export function ok(val?: any) {
  return new Ok(val);
}

export function fail<F>(fail: F) {
  return new Fail(fail);
}

class Ok<T, F extends never> extends Result<T, F> {
  type: symbol = ResultType.Ok;

  constructor(private readonly val: T) {
    super();
  }

  isOk(): this is Ok<T, F> {
    return true;
  }
  isFail(): this is Fail<never, F> {
    return false;
  }
  extract(): T {
    return this.val;
  }

  when<U>(fn: When<T, F, U>): U {
    return fn.ok(this.val);
  }
  whenOk<U>(fn: (val: T) => U): F | U {
    return fn(this.val);
  }
  whenFail<U>(fn: (err: F) => U): T | U {
    return this.val;
  }

  map<T2>(fn: (val: T) => T2): Result<T2, F> {
    return ok(fn(this.val));
  }
  mapFail<F2>(_fn: (fail: F) => F2): Result<T, F2> {
    return this;
  }
  andThen<T2>(fn: (val: T) => Result<T2, F>): Result<T2, F> {
    return fn(this.val);
  }
  orElse<F2>(_fn: (fail: F) => Result<T, F2>): Result<T, F2> {
    return this;
  }
}

class Fail<T extends never, F> extends Result<T, F> {
  type: symbol = ResultType.Fail;

  constructor(private readonly fail: F) {
    super();
  }

  isOk(): this is Ok<T, never> {
    return false;
  }
  isFail(): this is Fail<T, F> {
    return true;
  }
  extract(): F {
    return this.fail;
  }

  when<U>(fn: When<T, F, U>): U {
    return fn.fail(this.fail);
  }
  whenOk<U>(_fn: (val: T) => U): F | U {
    return this.fail;
  }
  whenFail<U>(fn: (err: F) => U): T | U {
    return fn(this.fail);
  }

  map<T2>(_fn: (val: T) => T2): Result<T2, F> {
    return this;
  }
  mapFail<F2>(fn: (fail: F) => F2): Result<T, F2> {
    return fail(fn(this.fail));
  }
  andThen<T2>(_fn: (val: T) => Result<T2, F>): Result<T2, F> {
    return this;
  }
  orElse<F2>(fn: (fail: F) => Result<T, F2>): Result<T, F2> {
    return fn(this.fail);
  }
}

// export class Result<TSuccess, TFailure> {
//   public static success<T>(success: T) {
//     return new Result<T, any>(success, undefined, false);
//   }

//   public static failure<T>(error: T) {
//     return new Result<any, T>(undefined, error, true);
//   }

//   constructor(private success: TSuccess, private failure: TFailure, private isError: boolean) {}

//   onFailure<T>(fn: (e: TFailure) => T) {
//     return this.isError ? fn(this.failure) : this.success;
//   }
// }
