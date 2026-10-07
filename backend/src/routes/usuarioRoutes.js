const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

const { verificarToken, verificarRol, verificarJerarquia } = require('../middlewares/authMiddleware');
const validarCampos = require('../middlewares/validarCampos');

const validarPassword = require('../utils/validarPassword');

// Validación de entrada para la creación de usuarios (soporta nombre / nombre_completo, correo / correo_institucional, password / contraseña / clave)
const validarUsuario = [
  body().custom((value) => {
    if (!value.nombre_completo && !value.nombre) {
      throw new Error('El nombre es obligatorio.');
    }
    const email = value.correo_institucional || value.correo;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Correo institucional inválido.');
    }
    const pass = value.password || value.contraseña || value.clave;
    if (pass) {
      const check = validarPassword(pass);
      if (!check.valida) {
        throw new Error(check.mensaje);
      }
      value.password = pass;
    } else {
      value.password = 'Sena1234*';
    }
    return true;
  }),
  validarCampos
];

// Crear usuario (Admin o Supervisor)
router.post('/', verificarToken, verificarRol('Administrador', 'Supervisor'), verificarJerarquia, validarUsuario, usuarioController.crearUsuario);

// Listar usuarios (Admin: todos; Supervisor: solo los suyos; permite filtro ?rol=)
router.get('/', verificarToken, usuarioController.obtenerUsuarios);

// Flujo 7: habilitar/deshabilitar cuenta (Admin)
router.patch('/estado/:id', verificarToken, verificarRol('Administrador'), usuarioController.cambiarEstadoUsuario);

// Consultar, actualizar y eliminar un usuario específico
router.get('/:id', verificarToken, usuarioController.obtenerUsuario);
router.patch('/:id', verificarToken, usuarioController.actualizarUsuario);
router.delete('/:id', verificarToken, usuarioController.eliminarUsuario);

module.exports = router;
