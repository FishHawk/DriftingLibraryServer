class AsyncTaskCancelError extends Error {
  constructor(message) {
    super();
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message || 'Async task is cancelled.';
  }
}

class ApplicationError extends Error {
  constructor(status, message) {
    super();
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message || 'Unknown error.';
    this.status = status || 500;
  }
}

class BadRequestError extends ApplicationError {
  constructor(message) {
    super(400, message);
  }
}

class NotFoundError extends ApplicationError {
  constructor(message) {
    super(404, message);
  }
}

class ConflictError extends ApplicationError {
  constructor(message) {
    super(409, message);
  }
}

function errorWarp(callback) {
  return function (req, res, next) {
    callback(req, res, next).catch(next);
  };
}

function errorHandler(err, req, res, next) {
  if (err instanceof ApplicationError) res.status(err.status).send(err.message);
  else res.status(500).send(err);
}

export default {
  AsyncTaskCancelError,
  ApplicationError,
  BadRequestError,
  NotFoundError,
  ConflictError,
  errorWarp,
  errorHandler,
};
