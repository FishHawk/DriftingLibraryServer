export class Result<TSuccess, TFailure> {
  public static success<T>(success: T) {
    return new Result<T, any>(success, undefined, false);
  }

  public static failure<T>(error: T) {
    return new Result<any, T>(undefined, error, true);
  }

  constructor(private success: TSuccess, private failure: TFailure, private isError: boolean) {}

  onFailure<T>(fn: (e: TFailure) => T) {
    return this.isError ? fn(this.failure) : this.success;
  }
}
