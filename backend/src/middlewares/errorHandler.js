const AppError = require('../utils/AppError');

// Manejador central de errores
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Error de validación de express-validator / mongoose
  if (error.name === 'ValidationError') {
    const mensaje = Object.values(error.errors).map(e => e.message).join('. ');
    error = new AppError(mensaje, 400);
  }

  if (error.code === 11000) {
    error = new AppError('Registro duplicado: el valor ya existe en el sistema.', 400);
  }

  const statusCode = error.statusCode || 500;
  const mensaje = error.isOperational ? error.message : 'Error interno del servidor.';

  if (statusCode === 500) {
    console.error('Error no controlado:', error);
  }

  return res.status(statusCode).json({ mensaje });
};

module.exports = errorHandler;
