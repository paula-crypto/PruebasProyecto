const mongoose = require('mongoose');

const historialAuditoriaSchema = new mongoose.Schema({
    usuario_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    accion: {
        type: String,
        required: true
    },
    entidad_afectada: {
        type: String,
        required: true
    },
    detalles: {
        type: Object
    }
}, {
    timestamps: true,
    collection: 'historial_auditoria'
});

module.exports = mongoose.model('HistorialAuditoria', historialAuditoriaSchema);