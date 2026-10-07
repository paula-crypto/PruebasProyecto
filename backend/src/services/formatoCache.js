const FormatoConfig = require('../models/FormatoConfig');

// Caché en memoria RAM de la versión vigente del formato GCCON-F-088.
// Se limpia cuando el Administrador actualiza la plantilla (Flujo 6).
let cache = null;

const getFormatoVigente = async () => {
  if (cache) return cache;

  cache = await FormatoConfig.findOne().sort({ numero_version: -1 });
  return cache;
};

const invalidarCache = () => {
  cache = null;
};

module.exports = { getFormatoVigente, invalidarCache };
