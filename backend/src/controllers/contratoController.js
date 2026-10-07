const mongoose = require('mongoose');
const Contrato = require('../models/Contrato');
const DependenciaArea = require('../models/DependenciaArea');
const BienEntregado = require('../models/BienEntregado');
const TrazabilidadFirma = require('../models/TrazabilidadFirma');
const { getFormatoVigente } = require('../services/formatoCache');
const { registrar } = require('../services/auditoriaService');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// Helper: resolver la dependencia por su ObjectId o por su nombre
async function resolverDependencia(valor) {
    const valorTexto = String(valor || '').trim();
    if (!valorTexto) {
        let porDefecto = await DependenciaArea.findOne();
        return porDefecto;
    }

    if (mongoose.isValidObjectId(valorTexto)) {
        const porId = await DependenciaArea.findById(valorTexto);
        if (porId) return porId;
    }

    // Buscar exacto o insensible a mayúsculas/minúsculas
    let porNombre = await DependenciaArea.findOne({
        nombre_dependencia: { $regex: new RegExp('^' + valorTexto.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') + '$', 'i') }
    });

    if (!porNombre) {
        const primeraPalabra = valorTexto.split(/\s+/)[0];
        if (primeraPalabra && primeraPalabra.length > 3) {
            porNombre = await DependenciaArea.findOne({
                nombre_dependencia: { $regex: new RegExp(primeraPalabra, 'i') }
            });
        }
    }

    if (!porNombre) {
        porNombre = await DependenciaArea.create({
            nombre_dependencia: valorTexto,
            activo: true
        });
    }

    return porNombre;
}

// Diagrama 2: Registro contractual e inventario (transacción atómica + fallback)
exports.crearContrato = asyncHandler(async (req, res) => {
    const { numero, telefono, dependencia, bienes, contratista, nombre_contratista, estado, documento_contratista, identificacion, documento } = req.body;

    const usuarioId = req.usuario?.id || req.usuario?._id || req.usuario?.uid;
    if (!usuarioId) {
        throw new AppError('No se pudo identificar al usuario autenticado.', 401);
    }

    if (!numero || !telefono) {
        throw new AppError('El número de contrato y teléfono son requeridos.', 400);
    }

    const dependenciaArea = await resolverDependencia(dependencia || 'Gestión Tecnológica');

    if (Array.isArray(bienes)) {
        for (const bien of bienes) {
            const cod = bien.codigo_inventario || bien.codigo || bien.placa;
            if (!cod || !String(cod).trim()) {
                throw new AppError('Cada bien entregado debe incluir un código de inventario válido.', 400);
            }
        }
    }

    const listaBienes = Array.isArray(bienes) && bienes.length > 0 ? bienes : [
        {
            descripcion: 'Equipo de cómputo y accesorios de oficina',
            codigo_inventario: `INV-${Date.now().toString().slice(-4)}`,
            estado_bien: 'Bueno'
        }
    ];

    let versionFormato = 1;
    try {
        const formato = await getFormatoVigente();
        if (formato && formato.numero_version) versionFormato = formato.numero_version;
    } catch (e) {
        console.warn('No se pudo obtener la versión del formato, usando 1:', e.message);
    }

    const nombreFinal = contratista || nombre_contratista || req.usuario?.nombre || req.usuario?.nombre_completo || 'Contratista';
    const docFinal = documento_contratista || identificacion || documento || req.usuario?.documento || '';

    // Si el número de contrato ya existe, actualizarlo para garantizar la persistencia del nombre y evitar colisiones
    const contratoExistente = await Contrato.findOne({ numero_contrato: numero });
    if (contratoExistente) {
        contratoExistente.nombre_contratista = nombreFinal;
        contratoExistente.correo_contratista = req.usuario?.correo || req.usuario?.correo_institucional || contratoExistente.correo_contratista;
        contratoExistente.telefono = telefono || contratoExistente.telefono;
        if (docFinal) contratoExistente.documento_contratista = docFinal;
        contratoExistente.dependencia = dependenciaArea._id;
        contratoExistente.estado = 'En revisión';
        await contratoExistente.save();

        try {
            const DependenciaArea = require('../models/DependenciaArea');
            const areasActivas = await DependenciaArea.find({ activo: true });
            for (const area of areasActivas) {
                const trazExist = await TrazabilidadFirma.findOne({ contrato_id: contratoExistente._id, area_id: area._id });
                if (!trazExist) {
                    await TrazabilidadFirma.create({
                        contrato_id: contratoExistente._id,
                        area_id: area._id,
                        estado: 'Pendiente',
                        hash_verificacion: ''
                    });
                }
            }
        } catch (firmaErr) {
            console.warn('Aviso trazabilidad actualización:', firmaErr.message);
        }

        return res.status(200).json({
            mensaje: 'Solicitud contractual actualizada exitosamente en estado En revisión.',
            contrato: contratoExistente
        });
    }

    const nuevoContrato = new Contrato({
        numero_contrato: numero,
        nombre_contratista: nombreFinal,
        correo_contratista: req.usuario?.correo || req.usuario?.correo_institucional || req.usuario?.email || 'contratista@sena.edu.co',
        telefono,
        documento_contratista: docFinal,
        dependencia: dependenciaArea._id,
        usuario: usuarioId,
        supervisor: req.usuario?.supervisor_id || null,
        estado: estado || 'En revisión',
        version_formato: versionFormato
    });

    const bienesConContrato = listaBienes.map(bien => ({
        descripcion: bien.descripcion || bien.nombre,
        codigo_inventario: bien.codigo_inventario || bien.codigo || bien.placa,
        cantidad: bien.cantidad || 1,
        estado_bien: bien.estado_bien || 'Bueno',
        contrato_id: nuevoContrato._id
    }));

    // Intentar transacción atómica (requiere replica set en MongoDB)
    const session = await mongoose.startSession();
    let creado = false;

    try {
        await session.withTransaction(async () => {
            await nuevoContrato.save({ session });
            await BienEntregado.insertMany(bienesConContrato, { session });
        });
        creado = true;
    } catch (txError) {
        console.warn('Transacción fallida o no soportada, intentando fallback:', txError.message);
    } finally {
        try { session.endSession(); } catch (e) { /* noop */ }
    }

    // Fallback secuencial con compensación manual (standalone)
    if (!creado) {
        try {
            await nuevoContrato.save();
            await BienEntregado.insertMany(bienesConContrato);
        } catch (fallbackErr) {
            await Contrato.findByIdAndDelete(nuevoContrato._id).catch(() => {});
            throw new AppError('Error interno del servidor al procesar el contrato (fallback).', 500);
        }
    }

    try {
        const DependenciaArea = require('../models/DependenciaArea');
        const areasActivas = await DependenciaArea.find({ activo: true });
        for (const area of areasActivas) {
            const existe = await TrazabilidadFirma.findOne({ contrato_id: nuevoContrato._id, area_id: area._id });
            if (!existe) {
                await TrazabilidadFirma.create({
                    contrato_id: nuevoContrato._id,
                    area_id: area._id,
                    estado: 'Pendiente',
                    hash_verificacion: ''
                });
            }
        }
    } catch (firmaErr) {
        console.warn('Aviso: No se pudieron generar todos los casilleros de firma automáticos:', firmaErr.message);
    }

    await registrar({
        usuario_id: usuarioId,
        accion: 'CREAR_CONTRATO',
        entidad_afectada: 'contratos_gccon_f088',
        detalles: { contrato_id: nuevoContrato._id, numero_contrato: numero, modo: creado ? 'transaccion' : 'fallback' }
    });

    res.status(201).json({
        mensaje: 'Registro contractual e inventario creado exitosamente en estado En revisión.',
        contrato: nuevoContrato
    });
});

// RF-005: Contratista consulta el estado de sus propias solicitudes
exports.misSolicitudes = asyncHandler(async (req, res) => {
    const usuarioId = req.usuario?.id || req.usuario?._id || req.usuario?.uid;
    const contratos = await Contrato.find({ usuario: usuarioId })
        .populate('dependencia', 'nombre_dependencia')
        .populate('supervisor', 'nombre_completo correo_institucional')
        .populate('usuario', 'nombre_completo correo_institucional documento telefono')
        .sort({ createdAt: -1 });
    res.status(200).json(contratos);
});

// Listar contratos según el rol (Supervisor: asignados; ResponsableArea: con firma en su área o en revisión; Admin: todos)
exports.listarContratos = asyncHandler(async (req, res) => {
    const normalizarRolInterno = (r) => {
        if (!r) return 'Administrador';
        const lower = r.toString().toLowerCase().replace(/[^a-z]/g, '');
        if (lower.includes('admin')) return 'Administrador';
        if (lower.includes('super')) return 'Supervisor';
        if (lower.includes('responsable')) return 'ResponsableArea';
        return 'Contratista';
    };

    const rol = normalizarRolInterno(req.usuario?.rol);
    const usuarioId = req.usuario?.id || req.usuario?._id || req.usuario?.uid;
    let filtro = {};

    if (rol === 'Supervisor') {
        filtro = { supervisor: usuarioId };
    } else if (rol === 'Contratista') {
        filtro = { $or: [{ usuario: usuarioId }, { correo_contratista: req.usuario?.correo || req.usuario?.correo_institucional }] };
    } else if (rol === 'ResponsableArea') {
        let dependencia_id = req.usuario?.dependencia_id;
        if (!dependencia_id) {
            const DependenciaArea = require('../models/DependenciaArea');
            const dep = await DependenciaArea.findOne({ responsable_id: usuarioId });
            if (dep) dependencia_id = dep._id;
        }
        if (dependencia_id) {
            const firmasPendientes = await TrazabilidadFirma.find({ area_id: dependencia_id }).distinct('contrato_id');
            filtro = {
                $or: [
                    { _id: { $in: firmasPendientes } },
                    { dependencia: dependencia_id },
                    { estado: { $in: ['En revisión', 'En revision', 'Firmado', 'Finalizado'] } }
                ]
            };
        } else {
            filtro = { estado: { $in: ['En revisión', 'En revision', 'Firmado', 'Finalizado'] } };
        }
    } else if (rol !== 'Administrador') {
        throw new AppError('Acceso denegado.', 403);
    }

    const contratos = await Contrato.find(filtro)
        .populate('dependencia', 'nombre_dependencia')
        .populate('supervisor', 'nombre_completo correo_institucional')
        .populate('usuario', 'nombre_completo correo_institucional documento telefono')
        .sort({ createdAt: -1 });

    const contratosIds = contratos.map(c => c._id);
    const todosBienes = await BienEntregado.find({ contrato_id: { $in: contratosIds } });
    const trazabilidades = await TrazabilidadFirma.find({ contrato_id: { $in: contratosIds } }).populate('area_id', 'nombre_dependencia');

    const contratosNormalizados = contratos.map(c => {
        const obj = c.toObject();
        if (obj.estado !== 'Firmado' && obj.estado !== 'Finalizado' && obj.estado !== 'Rechazado') {
            obj.estado = 'En revisión';
        }
        const docResuelto = c.documento_contratista || c.usuario?.documento || '';
        obj.documento_contratista = docResuelto;
        obj.identificacion = docResuelto;
        obj.documento = docResuelto;
        obj.bienes = todosBienes.filter(b => String(b.contrato_id) === String(c._id));
        obj.firmas = trazabilidades.filter(t => String(t.contrato_id) === String(c._id));
        return obj;
    });

    res.status(200).json(contratosNormalizados);
});

// Obtener detalle de un contrato (según permisos por rol)
exports.obtenerContrato = asyncHandler(async (req, res) => {
    const contrato = await Contrato.findById(req.params.id)
        .populate('dependencia', 'nombre_dependencia')
        .populate('supervisor', 'nombre_completo correo_institucional')
        .populate('usuario', 'nombre_completo correo_institucional');

    if (!contrato) {
        throw new AppError('Contrato no encontrado.', 404);
    }

    const rol = req.usuario?.rol;
    const usuarioId = req.usuario?.id || req.usuario?._id || req.usuario?.uid;

    if (rol === 'Contratista' && String(contrato.usuario?._id || contrato.usuario) !== String(usuarioId)) {
        throw new AppError('Acceso denegado. Este contrato no te pertenece.', 403);
    }

    if (rol === 'Supervisor' && String(contrato.supervisor?._id || contrato.supervisor) !== String(usuarioId)) {
        throw new AppError('Acceso denegado. No estás asignado a este contrato.', 403);
    }

    const bienes = await BienEntregado.find({ contrato_id: contrato._id });
    res.status(200).json({ contrato, bienes });
});

// RF-002: Actualizar contrato (Contratista en Borrador, o Supervisor/Administrador en cualquier momento)
exports.actualizarContrato = asyncHandler(async (req, res) => {
    let contrato = null;
    if (mongoose.isValidObjectId(req.params.id)) {
        contrato = await Contrato.findById(req.params.id);
    }
    if (!contrato) {
        contrato = await Contrato.findOne({ numero_contrato: req.params.id });
    }
    if (!contrato) {
        throw new AppError('Contrato no encontrado.', 404);
    }

    const usuarioId = req.usuario?.id || req.usuario?._id || req.usuario?.uid;
    const rol = req.usuario?.rol;

    if (rol === 'Contratista') {
        if (String(contrato.usuario) !== String(usuarioId)) {
            throw new AppError('Acceso denegado. Este contrato no te pertenece.', 403);
        }
        if (contrato.estado !== 'Borrador') {
            throw new AppError('Solo se puede modificar un contrato en estado Borrador.', 400);
        }
    }

    const { numero, numero_contrato, telefono, dependencia, contratista, nombre_contratista, estado, observaciones_supervisor, observacion_rechazo, observacionRechazo, motivo, documento_contratista, identificacion, documento } = req.body;
    if (numero !== undefined) contrato.numero_contrato = numero;
    if (numero_contrato !== undefined) contrato.numero_contrato = numero_contrato;
    if (telefono !== undefined) contrato.telefono = telefono;
    if (contratista !== undefined) contrato.nombre_contratista = contratista;
    if (nombre_contratista !== undefined) contrato.nombre_contratista = nombre_contratista;
    if (estado !== undefined) contrato.estado = estado;
    const docActualizar = documento_contratista || identificacion || documento;
    if (docActualizar !== undefined) contrato.documento_contratista = docActualizar;

    const motivoFinal = observaciones_supervisor || observacion_rechazo || observacionRechazo || motivo;
    if (motivoFinal !== undefined) contrato.observaciones_supervisor = motivoFinal;

    if (dependencia !== undefined) {
        const dependenciaArea = await resolverDependencia(dependencia);
        contrato.dependencia = dependenciaArea._id;
    }

    await contrato.save();

    await registrar({
        usuario_id: usuarioId,
        accion: 'ACTUALIZAR_CONTRATO',
        entidad_afectada: 'contratos_gccon_f088',
        detalles: { contrato_id: contrato._id, estado: contrato.estado }
    });

    res.status(200).json({ mensaje: 'Contrato actualizado exitosamente.', contrato });
});

// RF-002 esc.4: Cancelar (eliminar) un contrato en estado Borrador
exports.cancelarContrato = asyncHandler(async (req, res) => {
    const contrato = await Contrato.findById(req.params.id);
    if (!contrato) {
        throw new AppError('Contrato no encontrado.', 404);
    }

    const usuarioId = req.usuario?.id || req.usuario?._id || req.usuario?.uid;
    if (String(contrato.usuario) !== String(usuarioId)) {
        throw new AppError('Acceso denegado. Este contrato no te pertenece.', 403);
    }

    if (contrato.estado !== 'Borrador') {
        throw new AppError('Solo se puede cancelar un contrato en estado Borrador.', 400);
    }

    await BienEntregado.deleteMany({ contrato_id: contrato._id });
    await Contrato.findByIdAndDelete(contrato._id);

    await registrar({
        usuario_id: usuarioId,
        accion: 'CANCELAR_CONTRATO',
        entidad_afectada: 'contratos_gccon_f088',
        detalles: { contrato_id: contrato._id }
    });

    res.status(200).json({ mensaje: 'Contrato cancelado exitosamente.' });
});

// RF-003 esc.4: Eliminar un bien del inventario (contrato en Borrador)
exports.eliminarBien = asyncHandler(async (req, res) => {
    const { id, bienId } = req.params;

    const contrato = await Contrato.findById(id);
    if (!contrato) {
        throw new AppError('Contrato no encontrado.', 404);
    }

    const usuarioId = req.usuario?.id || req.usuario?._id || req.usuario?.uid;
    if (String(contrato.usuario) !== String(usuarioId)) {
        throw new AppError('Acceso denegado. Este contrato no te pertenece.', 403);
    }

    if (contrato.estado !== 'Borrador') {
        throw new AppError('Solo se puede modificar el inventario en estado Borrador.', 400);
    }

    const bien = await BienEntregado.findOneAndDelete({ _id: bienId, contrato_id: contrato._id });
    if (!bien) {
        throw new AppError('Bien no encontrado en este contrato.', 404);
    }

    await registrar({
        usuario_id: usuarioId,
        accion: 'ELIMINAR_BIEN',
        entidad_afectada: 'bienes_entregados',
        detalles: { contrato_id: contrato._id, bien_id: bienId }
    });

    res.status(200).json({ mensaje: 'Bien eliminado exitosamente.' });
});

// RF-014 esc.4: Consultar todas las observaciones del trámite (supervisor + áreas)
exports.obtenerObservaciones = asyncHandler(async (req, res) => {
    const contrato = await Contrato.findById(req.params.id);
    if (!contrato) {
        throw new AppError('Contrato no encontrado.', 404);
    }

    const usuarioId = req.usuario?.id || req.usuario?._id || req.usuario?.uid;
    const rol = req.usuario?.rol;
    const esDueno = String(contrato.usuario) === String(usuarioId);
    const esSupervisor = rol === 'Supervisor' && String(contrato.supervisor) === String(usuarioId);

    if (!esDueno && !esSupervisor && rol !== 'Administrador') {
        throw new AppError('Acceso denegado.', 403);
    }

    const firmas = await TrazabilidadFirma.find({
        contrato_id: contrato._id,
        observacion_rechazo: { $ne: null }
    }).populate('area_id', 'nombre_dependencia');

    const observaciones_areas = firmas
        .filter(f => f.observacion_rechazo)
        .map(f => ({
            area: f.area_id?.nombre_dependencia || f.area_id,
            observacion: f.observacion_rechazo,
            estado: f.estado
        }));

    res.status(200).json({
        observaciones_supervisor: contrato.observaciones_supervisor || null,
        observaciones_areas
    });
});
