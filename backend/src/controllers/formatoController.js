const FormatoConfig = require('../models/FormatoConfig');
const { invalidarCache, getFormatoVigente } = require('../services/formatoCache');
const { registrar } = require('../services/auditoriaService');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// Flujo 6: Actualizar en caliente la plantilla GCCON-F-088 (Admin)
exports.actualizarFormato = asyncHandler(async (req, res) => {
    const { numero_version, fecha_vigencia, texto_encabezado, campos_obligatorios } = req.body;

    const datos = {};
    if (numero_version !== undefined) datos.numero_version = numero_version;
    if (fecha_vigencia !== undefined) datos.fecha_vigencia = fecha_vigencia;
    if (texto_encabezado !== undefined) datos.texto_encabezado = texto_encabezado;
    if (campos_obligatorios !== undefined) datos.campos_obligatorios = campos_obligatorios;

    if (Object.keys(datos).length === 0) {
        throw new AppError('No se enviaron campos para actualizar.', 400);
    }

    // upsert: crea el documento si no existe o lo sobrescribe en una sola operación
    const formato = await FormatoConfig.findOneAndUpdate(
        { codigo_formato: 'GCCON-F-088' },
        { $set: datos },
        { upsert: true, new: true }
    );

    // Limpiar caché en memoria RAM para que los nuevos contratos hereden la versión
    invalidarCache();

    await registrar({
        usuario_id: req.usuario?.id || req.usuario?._id || req.usuario?.uid,
        accion: 'ACTUALIZAR_FORMATO',
        entidad_afectada: 'formato_config',
        detalles: datos
    });

    return res.status(200).json({ mensaje: 'Formato actualizado exitosamente.', formato });
});

// RF-004: Obtener la versión vigente del formato
exports.obtenerFormatoVigente = asyncHandler(async (req, res) => {
    const formato = await getFormatoVigente();
    if (!formato) {
        throw new AppError('No hay un formato configurado.', 404);
    }
    return res.status(200).json(formato);
});
