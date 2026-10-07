const express = require('express');
const router = express.Router();
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');
const auditoriaController = require('../controllers/auditoriaController');

// RNF-003: trazabilidad de acciones (solo Admin)
router.get('/', verificarToken, verificarRol('Administrador'), auditoriaController.obtenerAuditoria);

module.exports = router;
