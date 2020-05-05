class ApplicationError extends Error {
  constructor(status, message) {
    super();
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message || 'Unknown error.';
    this.status = status || 500;
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

module.exports = {
  ApplicationError,
  errorWarp,
  errorHandler,
};
