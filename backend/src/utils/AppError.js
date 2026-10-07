class AppError extends Error {
  constructor(mensaje, statusCode = 500) {
    super(mensaje);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
