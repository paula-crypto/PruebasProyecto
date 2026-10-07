const mongoose = require('mongoose');

const trazabilidadFirmaSchema = new mongoose.Schema({
    contrato_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contrato'
    },
    area_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DependenciaArea'
    },
    usuario_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    estado: {
        type: String,
        enum: ['Pendiente', 'Aprobado', 'Rechazado'],
        default: 'Pendiente'
    },
    observacion_rechazo: {
        type: String,
        default: null
    },
    hash_verificacion: {
        type: String,
        default: ''
    },
    fecha_firma: {
        type: Date
    }
}, {
    timestamps: true,
    collection: 'trazabilidad_firmas'
});

module.exports = mongoose.model('TrazabilidadFirma', trazabilidadFirmaSchema);