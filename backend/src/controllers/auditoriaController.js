const HistorialAuditoria = require('../models/HistorialAuditoria');
const asyncHandler = require('../utils/asyncHandler');

// RNF-003: Consultar trazabilidad de acciones (Admin)
exports.obtenerAuditoria = asyncHandler(async (req, res) => {
    const auditoria = await HistorialAuditoria.find()
        .populate('usuario_id', 'nombre_completo correo_institucional rol')
        .sort({ createdAt: -1 })
        .limit(500);

    res.status(200).json(auditoria);
});
