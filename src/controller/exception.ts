
export class HttpError extends Error {
  status: number;

  constructor(status?: number, message?: string) {
    super();
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.status = status || 500;
    this.message = message || 'Unknown error.';
  }
}

export class BadRequestError extends HttpError {
  constructor(message?: string) {
    super(400, message);
  }
}

export class NotFoundError extends HttpError {
  constructor(message?: string) {
    super(404, message);
  }
}

export class ConflictError extends HttpError {
  constructor(message?: string) {
    super(409, message);
  }
}

export class InternalServerError extends HttpError {
  constructor(message?: string) {
    super(500, message);
  }
}
