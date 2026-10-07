const mongoose = require('mongoose');

const formatoConfigSchema = new mongoose.Schema({
    codigo_formato: {
        type: String,
        default: 'GCCON-F-088'
    },
    numero_version: {
        type: Number,
        required: true,
        default: 1
    },
    fecha_vigencia: {
        type: Date,
        default: Date.now
    },
    texto_encabezado: {
        type: String,
        required: true
    },
    campos_obligatorios: [{
        type: String
    }]
}, {
    timestamps: true,
    collection: 'formato_config'
});

module.exports = mongoose.model('FormatoConfig', formatoConfigSchema);