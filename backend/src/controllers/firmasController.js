const mongoose = require('mongoose');
const Contrato = require('../models/Contrato');
const TrazabilidadFirma = require('../models/TrazabilidadFirma');
const BienEntregado = require('../models/BienEntregado');
const crypto = require('crypto');
const { enviarCorreo } = require('../services/emailService');
const { generarPdf } = require('../services/pdfService');
const { registrar } = require('../services/auditoriaService');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// Diagrama 4: Dictamen de área, criptografía y motor PDF
exports.procesarFirma = asyncHandler(async (req, res) => {
    const { contratoId, accion, firma_base64, observacion_rechazo } = req.body;

    if (!contratoId || !accion) {
        throw new AppError('Faltan campos obligatorios: contratoId o accion.', 400);
    }

    const rol = req.usuario?.rol || '';
    const rolNorm = rol.replace(/[\s_-]+/g, '').toUpperCase();
    if (!rolNorm.includes('RESPONSABLE') && !rolNorm.includes('ADMIN') && !rolNorm.includes('SUPERVISOR') && !rolNorm.includes('CONTRATISTA')) {
        throw new AppError('Acceso denegado. No está autorizado para registrar firmas en el trámite.', 403);
    }

    let contrato = null;
    if (mongoose.isValidObjectId(contratoId)) {
        contrato = await Contrato.findById(contratoId);
    }
    if (!contrato) {
        contrato = await Contrato.findOne({ numero_contrato: contratoId });
    }
    if (!contrato) {
        throw new AppError('Contrato no encontrado.', 404);
    }

    const usuarioId = req.usuario.id || req.usuario._id || req.usuario.uid;

    let areaId = req.usuario?.dependencia_id || req.body?.area_id;
    if (!areaId) {
        const DependenciaArea = require('../models/DependenciaArea');
        const dep = await DependenciaArea.findOne({ responsable_id: usuarioId });
        if (dep) areaId = dep._id;
    }
    if (!areaId) {
        const pendiente = await TrazabilidadFirma.findOne({ contrato_id: contrato._id, estado: 'Pendiente' });
        if (pendiente) areaId = pendiente.area_id;
    }

    let traz = await TrazabilidadFirma.findOne({ contrato_id: contrato._id, area_id: areaId });
    if (!traz) {
        traz = await TrazabilidadFirma.findOne({ contrato_id: contrato._id });
    }
    if (!traz) {
        traz = await TrazabilidadFirma.create({
            contrato_id: contrato._id,
            area_id: areaId || contrato.dependencia || null,
            estado: 'Pendiente',
            hash_verificacion: ''
        });
    }

    // Bloquear firmas o aprobaciones si el contrato está en estado Rechazado
    if (contrato.estado === 'Rechazado' && (accion === 'Aprobar' || accion === 'aprobar' || accion === 'APROBAR')) {
        throw new AppError('El trámite de paz y salvo se encuentra RECHAZADO por novedades u obligaciones pendientes. No es posible aprobar ni estampar firmas hasta que sea reactivado y subsanado.', 400);
    }

    // Manejar reactivación de un trámite previamente rechazado
    if (accion === 'Reactivar' || accion === 'reactivar' || accion === 'REACTIVAR') {
        contrato.estado = 'En revisión';
        contrato.observaciones_supervisor = '';
        await contrato.save();

        traz.estado = 'Pendiente';
        traz.observacion_rechazo = '';
        traz.usuario_id = usuarioId;
        traz.fecha_firma = new Date();
        await traz.save();

        await registrar({
            usuario_id: usuarioId,
            accion: 'REACTIVAR_TRAMITE',
            entidad_afectada: 'trazabilidad_firmas',
            detalles: { contrato_id: contrato._id, area_id: areaId }
        });

        return res.status(200).json({ mensaje: 'Trámite reactivado a En revisión exitosamente.', contrato });
    }

    // Manejar rechazo
    if (accion === 'Rechazar' || accion === 'rechazar' || accion === 'RECHAZAR') {
        if (!observacion_rechazo) {
            throw new AppError('Debe indicar una observación al rechazar.', 400);
        }

        traz.estado = 'Rechazado';
        traz.observacion_rechazo = observacion_rechazo;
        traz.usuario_id = usuarioId;
        traz.fecha_firma = new Date();
        await traz.save();

        contrato.estado = 'Rechazado';
        contrato.observaciones_supervisor = observacion_rechazo;
        await contrato.save();

        await enviarCorreo({
            to: contrato.correo_contratista,
            subject: `Paz y Salvo Rechazado - Contrato ${contrato.numero_contrato}`,
            text: `Su trámite fue rechazado por el área. Motivo: ${traz.observacion_rechazo}`
        });

        await registrar({
            usuario_id: usuarioId,
            accion: 'RECHAZAR_FIRMA',
            entidad_afectada: 'trazabilidad_firmas',
            detalles: { contrato_id: contrato._id, area_id: areaId, observacion_rechazo }
        });

        return res.status(200).json({ mensaje: 'Firma procesada: Rechazado', contrato });
    }

    // Manejar aprobación
    if (accion === 'Aprobar' || accion === 'aprobar' || accion === 'APROBAR') {
        const hash = crypto.createHash('sha256')
            .update(`${contrato._id}:${usuarioId}:${Date.now()}`)
            .digest('hex');

        traz.estado = 'Aprobado';
        traz.usuario_id = usuarioId;
        traz.fecha_firma = new Date();
        traz.hash_verificacion = hash;
        await traz.save();

        await registrar({
            usuario_id: usuarioId,
            accion: 'APROBAR_FIRMA',
            entidad_afectada: 'trazabilidad_firmas',
            detalles: { contrato_id: contrato._id, area_id: areaId, hash_verificacion: hash }
        });

        const pendientes = await TrazabilidadFirma.countDocuments({ contrato_id: contrato._id, estado: 'Pendiente' });

        if (pendientes > 0) {
            return res.status(200).json({ mensaje: 'Firma aprobada. Aún quedan firmas pendientes.', pendientes });
        }

        contrato.estado = 'Finalizado';
        await contrato.save();

        const bienes = await BienEntregado.find({ contrato_id: contrato._id });
        const firmas = await TrazabilidadFirma.find({ contrato_id: contrato._id }).populate('area_id', 'nombre_dependencia');

        let filepath = null;
        try {
            filepath = await generarPdf({
                contrato,
                bienes,
                firmas,
                firma_base64: firma_base64 || null
            });
        } catch (pdfErr) {
            console.warn('Aviso al generar PDF en finalización:', pdfErr.message);
        }

        try {
            await enviarCorreo({
                to: contrato.correo_contratista,
                subject: `Paz y Salvo Finalizado - Contrato ${contrato.numero_contrato}`,
                text: `Su paz y salvo ha finalizado. Adjunto encontrará el documento.`,
                attachments: filepath ? [{ filename: `pazysalvo_${contrato._id}.pdf`, path: filepath }] : []
            });
        } catch (mailErr) {
            console.warn('Aviso al enviar correo en finalización:', mailErr.message);
        }

        await registrar({
            usuario_id: usuarioId,
            accion: 'FINALIZAR_CONTRATO',
            entidad_afectada: 'contratos_gccon_f088',
            detalles: { contrato_id: contrato._id, pdf_path: filepath }
        });

        return res.status(200).json({ mensaje: 'Contrato finalizado, PDF generado y notificación enviada.', pdf_path: filepath });
    }

    throw new AppError('Acción no reconocida. Use "Aprobar" o "Rechazar".', 400);
});

// RF-013: Listar solicitudes de firma pendientes asignadas al responsable de área
exports.listarPendientes = asyncHandler(async (req, res) => {
    const rol = req.usuario?.rol;
    const filtro = { estado: 'Pendiente' };

    if (rol !== 'Administrador' && rol !== 'Supervisor') {
        if (!req.usuario?.dependencia_id) {
            return res.status(200).json([]);
        }
        filtro.area_id = req.usuario.dependencia_id;
    }

    const pendientes = await TrazabilidadFirma.find(filtro)
        .populate({ path: 'contrato_id', model: 'Contrato' })
        .populate({ path: 'area_id', model: 'DependenciaArea' });

    res.status(200).json(pendientes);
});

// RF-013: Listar historial de solicitudes ya gestionadas por el responsable de área
exports.listarHistorial = asyncHandler(async (req, res) => {
    const rol = req.usuario?.rol;
    const filtro = { estado: { $ne: 'Pendiente' } };

    if (rol !== 'Administrador' && rol !== 'Supervisor') {
        if (!req.usuario?.dependencia_id) {
            return res.status(200).json([]);
        }
        filtro.area_id = req.usuario.dependencia_id;
    }

    const historial = await TrazabilidadFirma.find(filtro)
        .populate({ path: 'contrato_id', model: 'Contrato' })
        .populate({ path: 'area_id', model: 'DependenciaArea' });

    res.status(200).json(historial);
});
