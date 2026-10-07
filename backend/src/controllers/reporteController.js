const mongoose = require('mongoose');
const Contrato = require('../models/Contrato');
const BienEntregado = require('../models/BienEntregado');
const TrazabilidadFirma = require('../models/TrazabilidadFirma');
const { generarPdf } = require('../services/pdfService');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const fs = require('fs');
const path = require('path');

// RF-010: Generar y descargar el PDF oficial GCCON-F-088
exports.descargarPdf = asyncHandler(async (req, res) => {
    let contrato;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
        contrato = await Contrato.findById(req.params.id);
    }
    if (!contrato) {
        contrato = await Contrato.findOne({ numero_contrato: req.params.id });
    }
    if (!contrato) {
        throw new AppError('Contrato no encontrado.', 404);
    }

    const rol = req.usuario?.rol;
    const usuarioId = req.usuario?.id || req.usuario?._id || req.usuario?.uid;

    if (
        rol !== 'Administrador' &&
        rol !== 'Supervisor' &&
        rol !== 'ResponsableArea' &&
        String(contrato.usuario) !== String(usuarioId)
    ) {
        throw new AppError('Acceso denegado. Este contrato no te pertenece.', 403);
    }

    // Si el trámite aún no ha finalizado se genera el documento preliminar con las firmas actuales
    if (contrato.estado === 'Borrador') {
        throw new AppError('El contrato aún se encuentra en Borrador. Debe ser enviado a revisión antes de generar el PDF.', 400);
    }

    const tmpPath = path.join(__dirname, '../../tmp', `pazysalvo_${contrato._id}.pdf`);
    if (fs.existsSync(tmpPath)) {
        return res.download(tmpPath, `pazysalvo_${contrato.numero_contrato}.pdf`);
    }

    const bienes = await BienEntregado.find({ contrato_id: contrato._id });
    const firmas = await TrazabilidadFirma.find({ contrato_id: contrato._id }).populate('area_id', 'nombre_dependencia');

    const filepath = await generarPdf({ contrato, bienes, firmas, firma_base64: null });

    return res.download(filepath, `pazysalvo_${contrato.numero_contrato}.pdf`);
});
