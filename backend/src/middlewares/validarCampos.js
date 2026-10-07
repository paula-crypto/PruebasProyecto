const { validationResult } = require('express-validator');

// Middleware que recoge los errores de express-validator y responde 400
const validarCampos = (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    const mensaje = errores.array().map(e => e.msg).join('. ');
    return res.status(400).json({ mensaje });
  }
  next();
};

module.exports = validarCampos;
