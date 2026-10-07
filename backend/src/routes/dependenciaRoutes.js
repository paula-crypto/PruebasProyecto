const express = require('express');
const router = express.Router();
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');
const dependenciaController = require('../controllers/dependenciaController');

// RF-012: gestión de dependencias y responsables de área (Supervisor / Administrador)
router.post('/', verificarToken, verificarRol('Supervisor', 'Administrador'), dependenciaController.crearDependencia);
// Cualquier usuario autenticado puede consultar las dependencias (el Contratista las selecciona al crear un contrato)
router.get('/', verificarToken, dependenciaController.obtenerDependencias);
router.put('/:id', verificarToken, verificarRol('Supervisor', 'Administrador'), dependenciaController.actualizarDependencia);
router.post('/:id/responsable', verificarToken, verificarRol('Supervisor', 'Administrador'), dependenciaController.asignarResponsable);

module.exports = router;
