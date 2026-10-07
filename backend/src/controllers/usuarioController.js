const Usuario = require('../models/Usuario');
const DependenciaArea = require('../models/DependenciaArea');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { registrar } = require('../services/auditoriaService');
const { ROLES_CREABLES_POR_ROL } = require('../middlewares/authMiddleware');
const validarPassword = require('../utils/validarPassword');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const usuarioIdActual = (req) => req.usuario?.id || req.usuario?._id || req.usuario?.uid;

// Helper para resolver dependencia por id o nombre
async function resolverDependenciaUsuario(valor) {
    const valorTexto = String(valor || '').trim();
    if (!valorTexto) return null;
    if (mongoose.isValidObjectId(valorTexto)) {
        const porId = await DependenciaArea.findById(valorTexto);
        if (porId) return porId._id;
    }
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
    return porNombre ? porNombre._id : null;
}

// Crear un usuario respetando la cadena jerárquica (RF-009, RF-011, RF-012)
exports.crearUsuario = asyncHandler(async (req, res) => {
    let { nombre_completo, nombre, correo_institucional, correo, password, contraseña, clave, rol, dependencia_id, dependencia, supervisor_id, supervisor, telefono, cargo, documento, numero_contrato, contrato } = req.body;

    nombre_completo = (nombre_completo || nombre || '').trim();
    correo_institucional = (correo_institucional || correo || '').trim().toLowerCase();
    documento = (documento || '').trim();
    password = (password || contraseña || clave || '12345678').toString();

    if (!nombre_completo || !correo_institucional || !password || !rol) {
        throw new AppError('Faltan campos obligatorios: nombre, correo, password, rol.', 400);
    }

    const condicionesExistente = [{ correo_institucional }];
    if (documento) condicionesExistente.push({ documento });
    const usuarioExistente = await Usuario.findOne({ $or: condicionesExistente });

    if (usuarioExistente) {
        throw new AppError('El correo institucional o documento ya está registrado.', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const creadorId = usuarioIdActual(req);
    let supervisorAsignadoId = (req.usuario?.rol === 'Supervisor' || req.usuario?.rol === 'SUPERVISOR') ? creadorId : null;

    if (!supervisorAsignadoId && supervisor_id && mongoose.isValidObjectId(supervisor_id)) {
        supervisorAsignadoId = supervisor_id;
    } else if (!supervisorAsignadoId && supervisor) {
        const supEncontrado = await Usuario.findOne({
            $or: [
                { nombre_completo: new RegExp(`^${supervisor.trim()}$`, 'i') },
                { documento: supervisor.trim() }
            ]
        });
        if (supEncontrado) supervisorAsignadoId = supEncontrado._id;
    }

    // Resolver dependencia
    let depResueltaId = await resolverDependenciaUsuario(dependencia_id || dependencia);

    // Si el usuario a crear es contratista y no trae dependencia, heredar la del supervisor asignado
    if (!depResueltaId && supervisorAsignadoId) {
        const supInfo = await Usuario.findById(supervisorAsignadoId);
        if (supInfo?.dependencia_id) {
            depResueltaId = supInfo.dependencia_id;
        }
    }

    const nuevoUsuario = new Usuario({
        nombre_completo,
        correo_institucional,
        documento,
        password_hash,
        rol,
        dependencia_id: depResueltaId || null,
        supervisor_id: supervisorAsignadoId,
        telefono,
        numero_contrato: (numero_contrato || contrato || '').trim(),
        cargo: cargo || (rol === 'Supervisor' || rol === 'SUPERVISOR' ? 'Supervisor de Contratos' : 'Contratista')
    });

    await nuevoUsuario.save();

    await registrar({
        usuario_id: creadorId,
        accion: 'CREAR_USUARIO',
        entidad_afectada: 'usuarios',
        detalles: { usuario_creado: nuevoUsuario._id, rol, correo_institucional, documento }
    }).catch(() => {});

    res.status(201).json({
        mensaje: 'Usuario creado exitosamente.',
        usuario: {
            id: nuevoUsuario._id,
            _id: nuevoUsuario._id,
            documento: nuevoUsuario.documento,
            nombre: nuevoUsuario.nombre_completo,
            nombre_completo: nuevoUsuario.nombre_completo,
            correo: nuevoUsuario.correo_institucional,
            correo_institucional: nuevoUsuario.correo_institucional,
            telefono: nuevoUsuario.telefono,
            cargo: nuevoUsuario.cargo,
            rol: nuevoUsuario.rol,
            dependencia_id: nuevoUsuario.dependencia_id,
            supervisor_id: nuevoUsuario.supervisor_id
        }
    });
});

// Consultar usuarios (Admin: todos; Supervisor: solo los que creó; o filtrado por ?rol=)
exports.obtenerUsuarios = asyncHandler(async (req, res) => {
    const filtro = {};

    if (req.query.rol) {
        const rolNorm = req.query.rol.toLowerCase().replace(/[^a-z]/g, '');
        if (rolNorm.includes('super')) {
            filtro.rol = { $in: ['Supervisor', 'SUPERVISOR'] };
        } else if (rolNorm.includes('responsable')) {
            filtro.rol = { $in: ['ResponsableArea', 'RESPONSABLE_AREA', 'Responsable de Área'] };
        } else if (rolNorm.includes('admin')) {
            filtro.rol = { $in: ['Administrador', 'ADMINISTRADOR'] };
        } else if (rolNorm.includes('contrat')) {
            filtro.rol = { $in: ['Contratista', 'CONTRATISTA'] };
        } else {
            filtro.rol = new RegExp(`^${req.query.rol}$`, 'i');
        }
    }

    const usuarios = await Usuario.find(filtro, '-password_hash -token_recuperacion -token_expiracion')
        .populate('dependencia_id', 'nombre_dependencia')
        .populate('supervisor_id', 'nombre_completo documento correo_institucional cargo')
        .sort({ createdAt: -1, _id: -1 })
        .lean();

    const formateados = usuarios.map((u, idx) => ({
        ...u,
        id: (u._id || `usr_${idx}`).toString(),
        _id: (u._id || `usr_${idx}`).toString(),
        nombre: u.nombre_completo || u.nombre || '—',
        correo: u.correo_institucional || u.correo || '—',
        documento: u.documento || u.telefono || `DOC-${idx + 1}`,
        dependencia: u.dependencia_id?.nombre_dependencia || u.dependencia || '',
        dependencia_id: u.dependencia_id?._id || u.dependencia_id || null,
        supervisor: u.supervisor_id?.nombre_completo || u.supervisor || '',
        supervisor_id: u.supervisor_id?._id || u.supervisor_id || null,
    }));

    res.status(200).json(formateados);
});

// Eliminar un usuario (por _id o por documento)
exports.eliminarUsuario = asyncHandler(async (req, res) => {
    const { id } = req.params;
    let usuario;
    if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
        usuario = await Usuario.findByIdAndDelete(id);
    } else {
        usuario = await Usuario.findOneAndDelete({ $or: [{ documento: id }, { correo_institucional: id }] });
    }

    if (!usuario) {
        throw new AppError('Usuario no encontrado para eliminar.', 404);
    }

    res.status(200).json({ mensaje: 'Usuario eliminado exitosamente.' });
});

// Consultar un usuario específico
exports.obtenerUsuario = asyncHandler(async (req, res) => {
    const usuario = await Usuario.findById(req.params.id, '-password_hash -token_recuperacion -token_expiracion');
    if (!usuario) {
        throw new AppError('Usuario no encontrado.', 404);
    }

    if (req.usuario.rol === 'Supervisor' && String(usuario.supervisor_id) !== String(usuarioIdActual(req))) {
        throw new AppError('Acceso denegado. Este usuario no te pertenece.', 403);
    }

    res.status(200).json(usuario);
});

// Actualizar datos de un usuario (RF-009)
exports.actualizarUsuario = asyncHandler(async (req, res) => {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) {
        throw new AppError('Usuario no encontrado.', 404);
    }

    if (req.usuario.rol === 'Supervisor' && String(usuario.supervisor_id) !== String(usuarioIdActual(req))) {
        throw new AppError('Acceso denegado. Este usuario no te pertenece.', 403);
    }

    const { nombre_completo, telefono, cargo, dependencia_id, dependencia, supervisor_id, supervisor, rol, numero_contrato, contrato } = req.body;

    // Cambio de rol (RF-009 esc.2): re-validar con la jerarquía
    if (rol !== undefined && rol !== usuario.rol) {
        if (String(usuario._id) === String(usuarioIdActual(req))) {
            throw new AppError('No puedes cambiar tu propio rol.', 400);
        }
        const permitidos = ROLES_CREABLES_POR_ROL[req.usuario.rol] || [];
        if (!permitidos.includes(rol)) {
            throw new AppError(`Tu rol (${req.usuario.rol}) no puede asignar el rol ${rol}.`, 403);
        }
        usuario.rol = rol;
    }

    if (nombre_completo !== undefined) usuario.nombre_completo = nombre_completo;
    if (telefono !== undefined) usuario.telefono = telefono;
    if (cargo !== undefined) usuario.cargo = cargo;
    if (dependencia_id !== undefined || dependencia !== undefined) {
        usuario.dependencia_id = await resolverDependenciaUsuario(dependencia_id || dependencia);
    }
    if (supervisor_id !== undefined || supervisor !== undefined) {
        let supId = supervisor_id;
        if (!supId && supervisor) {
            const supEncontrado = await Usuario.findOne({
                $or: [
                    { nombre_completo: new RegExp(`^${supervisor.trim()}$`, 'i') },
                    { documento: supervisor.trim() }
                ]
            });
            if (supEncontrado) supId = supEncontrado._id;
        }
        usuario.supervisor_id = supId || null;
    }
    if (numero_contrato !== undefined) usuario.numero_contrato = String(numero_contrato).trim();
    else if (contrato !== undefined) usuario.numero_contrato = String(contrato).trim();

    await usuario.save();

    await registrar({
        usuario_id: usuarioIdActual(req),
        accion: 'ACTUALIZAR_USUARIO',
        entidad_afectada: 'usuarios',
        detalles: { usuario_modificado: usuario._id }
    });

    res.status(200).json({ mensaje: 'Usuario actualizado exitosamente.', usuario });
});

// Flujo 7: Habilitar/deshabilitar cuenta en tiempo real (Admin)
exports.cambiarEstadoUsuario = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { activo } = req.body;

    if (activo === undefined) {
        throw new AppError('Debe indicar el campo "activo" (true/false).', 400);
    }

    const usuario = await Usuario.findById(id);
    if (!usuario) {
        throw new AppError('Usuario no encontrado.', 404);
    }

    if (String(usuario._id) === String(usuarioIdActual(req))) {
        throw new AppError('No puedes deshabilitar tu propia cuenta.', 400);
    }

    usuario.activo = !!activo;
    await usuario.save();

    await registrar({
        usuario_id: usuarioIdActual(req),
        accion: activo ? 'ACTIVAR_USUARIO' : 'DESACTIVAR_USUARIO',
        entidad_afectada: 'usuarios',
        detalles: { usuario_afectado: usuario._id }
    });

    res.status(200).json({
        mensaje: `Usuario ${activo ? 'habilitado' : 'deshabilitado'} exitosamente.`,
        usuario: { id: usuario._id, correo_institucional: usuario.correo_institucional, activo: usuario.activo }
    });
});
