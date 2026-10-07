const mongoose = require('mongoose');

const bienEntregadoSchema = new mongoose.Schema({
    contrato_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contrato'
    },
    descripcion: {
        type: String,
        required: [true, 'La descripción del bien es obligatoria'],
        trim: true
    },
    codigo_inventario: {
        type: String,
        trim: true
    },
    cantidad: {
        type: Number,
        default: 1
    },
    estado_bien: {
        type: String,
        default: 'Bueno'
    }
}, {
    timestamps: true,
    collection: 'bienes_entregados'
});

module.exports = mongoose.model('BienEntregado', bienEntregadoSchema);