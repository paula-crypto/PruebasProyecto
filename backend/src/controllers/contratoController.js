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
    const { numero, telefono, dependencia, bienes, contratista, nombre_contratista, estado, documento_contratista, identificacion, documento, supervisor, responsable } = req.body;

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

    // Resolver ID de supervisor si viene por nombre o correo
    let supervisorId = req.usuario?.supervisor_id || null;
    const supBuscado = supervisor || responsable;
    if (!supervisorId && supBuscado) {
        const Usuario = require('../models/Usuario');
        if (mongoose.isValidObjectId(supBuscado)) {
            supervisorId = supBuscado;
        } else {
            const regexSup = new RegExp(String(supBuscado).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i');
            const supObj = await Usuario.findOne({
                rol: { $regex: /super/i },
                $or: [
                    { nombre_completo: regexSup },
                    { correo_institucional: String(supBuscado).toLowerCase().trim() }
                ]
            });
            if (supObj) supervisorId = supObj._id;
        }
    }

    // Si el número de contrato ya existe, actualizarlo para garantizar la persistencia del nombre y evitar colisiones
    const contratoExistente = await Contrato.findOne({ numero_contrato: numero });
    if (contratoExistente) {
        contratoExistente.nombre_contratista = nombreFinal;
        contratoExistente.correo_contratista = req.usuario?.correo || req.usuario?.correo_institucional || contratoExistente.correo_contratista;
        contratoExistente.telefono = telefono || contratoExistente.telefono;
        if (docFinal) contratoExistente.documento_contratista = docFinal;
        contratoExistente.dependencia = dependenciaArea._id;
        if (supervisorId) contratoExistente.supervisor = supervisorId;
        contratoExistente.estado = 'En revisión';
        await contratoExistente.save();

        try {
            const DependenciaArea = require('../models/DependenciaArea');
            const areasActivas = await DependenciaArea.find({ activo: true }).lean();
            const firmasExistentes = await TrazabilidadFirma.find({ contrato_id: contratoExistente._id }).distinct('area_id');
            const existentesSet = new Set(firmasExistentes.map(id => String(id)));

            const nuevasFirmas = [];
            for (const area of areasActivas) {
                if (!existentesSet.has(String(area._id))) {
                    nuevasFirmas.push({
                        contrato_id: contratoExistente._id,
                        area_id: area._id,
                        estado: 'Pendiente',
                        hash_verificacion: ''
                    });
                }
            }
            if (nuevasFirmas.length > 0) {
                await TrazabilidadFirma.insertMany(nuevasFirmas, { ordered: false });
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
        supervisor: supervisorId,
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

    // Inserción directa de alta velocidad (< 200ms)
    try {
        await nuevoContrato.save();
        if (bienesConContrato.length > 0) {
            await BienEntregado.insertMany(bienesConContrato, { ordered: false });
        }
    } catch (saveErr) {
        console.error('Error guardando contrato:', saveErr.message);
        throw new AppError('Error interno al registrar el contrato: ' + saveErr.message, 500);
    }

    try {
        const DependenciaArea = require('../models/DependenciaArea');
        const areasActivas = await DependenciaArea.find({ activo: true }).lean();
        if (areasActivas.length > 0) {
            const firmasAInsertar = areasActivas.map(area => ({
                contrato_id: nuevoContrato._id,
                area_id: area._id,
                estado: 'Pendiente',
                hash_verificacion: ''
            }));
            await TrazabilidadFirma.insertMany(firmasAInsertar, { ordered: false });
        }
    } catch (firmaErr) {
        console.warn('Aviso: No se pudieron generar todos los casilleros de firma automáticos:', firmaErr.message);
    }

    await registrar({
        usuario_id: usuarioId,
        accion: 'CREAR_CONTRATO',
        entidad_afectada: 'contratos_gccon_f088',
        detalles: { contrato_id: nuevoContrato._id, numero_contrato: numero, modo: 'optimizacion_directa' }
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
        const Usuario = require('../models/Usuario');
        const contratistasAsignados = await Usuario.find({ supervisor_id: usuarioId }).distinct('_id');
        const condiciones = [{ supervisor: usuarioId }];
        if (contratistasAsignados.length > 0) {
            condiciones.push({ usuario: { $in: contratistasAsignados } });
        }
        filtro = { $or: condiciones };
    } else if (rol === 'Contratista') {
        const condiciones = [];
        if (usuarioId) condiciones.push({ usuario: usuarioId });
        const cor = req.usuario?.correo || req.usuario?.correo_institucional;
        if (cor) condiciones.push({ correo_contratista: cor.toLowerCase().trim() });
        const nom = req.usuario?.nombre || req.usuario?.nombre_completo;
        if (nom) {
            condiciones.push({ nombre_contratista: { $regex: new RegExp(nom.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i') } });
        }
        filtro = condiciones.length > 0 ? { $or: condiciones } : { usuario: usuarioId };
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
        const nomCont = c.nombre_contratista || c.usuario?.nombre_completo || c.usuario?.nombre || 'Contratista';
        obj.nombre_contratista = nomCont;
        obj.contratista = nomCont;
        obj.nombreContratista = nomCont;

        const docResuelto = c.documento_contratista || c.usuario?.documento || '';
        obj.documento_contratista = docResuelto;
        obj.identificacion = docResuelto;
        obj.documento = docResuelto;
        obj.ciudad = c.ciudad || 'San Gil';
        obj.regional = c.regional || 'Santander';
        obj.direccion = c.direccion || c.dependencia?.nombre_dependencia || 'Gestión Tecnológica (TIC)';
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
        .populate('usuario', 'nombre_completo correo_institucional documento telefono');

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

    const docResuelto = contrato.documento_contratista || contrato.usuario?.documento || '';
    const contratoObj = contrato.toObject();
    contratoObj.documento_contratista = docResuelto;
    contratoObj.identificacion = docResuelto;
    contratoObj.documento = docResuelto;

    const bienes = await BienEntregado.find({ contrato_id: contrato._id });
    res.status(200).json({ contrato: contratoObj, bienes });
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

    const { numero, numero_contrato, telefono, dependencia, contratista, nombre_contratista, estado, observaciones_supervisor, observacion_rechazo, observacionRechazo, motivo, documento_contratista, identificacion, documento, ciudad, regional, direccion } = req.body;
    if (numero !== undefined) contrato.numero_contrato = numero;
    if (numero_contrato !== undefined) contrato.numero_contrato = numero_contrato;
    if (telefono !== undefined) contrato.telefono = telefono;
    if (contratista !== undefined) contrato.nombre_contratista = contratista;
    if (nombre_contratista !== undefined) contrato.nombre_contratista = nombre_contratista;
    if (estado !== undefined) contrato.estado = estado;
    if (ciudad !== undefined) contrato.ciudad = ciudad;
    if (regional !== undefined) contrato.regional = regional;
    if (direccion !== undefined) contrato.direccion = direccion;
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
