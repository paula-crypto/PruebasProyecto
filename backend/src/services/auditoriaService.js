const HistorialAuditoria = require('../models/HistorialAuditoria');

// Registrar una acción para trazabilidad (RNF-003). No rompe el flujo si falla.
const registrar = async ({ usuario_id, accion, entidad_afectada, detalles = {} }) => {
  try {
    await HistorialAuditoria.create({
      usuario_id: usuario_id || null,
      accion,
      entidad_afectada,
      detalles
    });
  } catch (error) {
    console.error('Error registrando auditoría:', error.message);
  }
};

module.exports = { registrar };
