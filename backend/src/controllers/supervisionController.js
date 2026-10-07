const Contrato = require('../models/Contrato');
const DependenciaArea = require('../models/DependenciaArea');
const TrazabilidadFirma = require('../models/TrazabilidadFirma');
const { enviarCorreo } = require('../services/emailService');
const { registrar } = require('../services/auditoriaService');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// Diagrama 3: Validación del Supervisor y apertura de firmas
exports.evaluarContrato = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { aprobado, observaciones_supervisor } = req.body;

    if (req.usuario.rol !== 'Supervisor') {
        throw new AppError('Acceso denegado. Se requiere rol de Supervisor.', 403);
    }

    const contrato = await Contrato.findById(id);
    if (!contrato) {
        throw new AppError('Contrato no encontrado.', 404);
    }

    const usuarioId = (req.usuario.id || req.usuario._id || req.usuario.uid).toString();
    if (contrato.supervisor) {
        const supervisorId = contrato.supervisor.toString();
        if (supervisorId !== usuarioId) {
            throw new AppError('Acceso denegado. No estás asignado como supervisor de este contrato.', 403);
        }
    }

    if (aprobado === false) {
        // --- RECHAZADO ---
        contrato.estado = 'Rechazado';
        contrato.observaciones_supervisor = observaciones_supervisor || 'Rechazado por el supervisor.';
        await contrato.save();

        await enviarCorreo({
            to: contrato.correo_contratista,
            subject: `Paz y Salvo Rechazado - Contrato ${contrato.numero_contrato}`,
            text: `Estimado(a) ${contrato.nombre_contratista},\n\nSu paz y salvo requiere observaciones:\n"${contrato.observaciones_supervisor}"`
        });

        await registrar({
            usuario_id: usuarioId,
            accion: 'RECHAZAR_CONTRATO',
            entidad_afectada: 'contratos_gccon_f088',
            detalles: { contrato_id: contrato._id, observaciones_supervisor: contrato.observaciones_supervisor }
        });

        return res.status(200).json({
            mensaje: 'Contrato rechazado exitosamente. Retornado a estado Borrador.',
            contrato
        });
    }

    if (aprobado === true) {
        // --- APROBADO ---
        contrato.estado = 'Pendiente de Firmas';
        await contrato.save();

        const areasActivas = await DependenciaArea.find({ activo: true });

        for (const area of areasActivas) {
            const existe = await TrazabilidadFirma.findOne({ contrato_id: contrato._id, area_id: area._id });
            if (!existe) {
                await TrazabilidadFirma.create({
                    contrato_id: contrato._id,
                    area_id: area._id,
                    estado: 'Pendiente',
                    hash_verificacion: ''
                });
            } else {
                existe.estado = 'Pendiente';
                await existe.save();
            }
        }

        await registrar({
            usuario_id: usuarioId,
            accion: 'APROBAR_CONTRATO',
            entidad_afectada: 'contratos_gccon_f088',
            detalles: { contrato_id: contrato._id, casilleros_abiertos: areasActivas.length }
        });

        return res.status(200).json({
            mensaje: 'Contrato aprobado por el supervisor. Firma de áreas aperturada.',
            contrato
        });
    }

    throw new AppError('El campo "aprobado" debe ser true o false.', 400);
});
