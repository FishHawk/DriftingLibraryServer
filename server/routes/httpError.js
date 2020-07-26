export class HttpError extends Error {
  constructor(status, message) {
    super();
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message || 'Unknown error.';
    this.status = status || 500;
  }
}

export class BadRequestError extends HttpError {
  constructor(message) {
    super(400, message);
  }
}

export class NotFoundError extends HttpError {
  constructor(message) {
    super(404, message);
  }
}

export class ConflictError extends HttpError {
  constructor(message) {
    super(409, message);
  }
}

export class InternalServerError extends HttpError {
  constructor(message) {
    super(500, message);
  }
}

export function errorWarp(callback) {
  return function (req, res, next) {
    callback(req, res, next).catch(next);
  };
}
