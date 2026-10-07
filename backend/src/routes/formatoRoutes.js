const express = require('express');
const router = express.Router();
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');
const formatoController = require('../controllers/formatoController');

// Flujo 6 / RF-004: actualizar y consultar la versión vigente del formato
router.put('/actualizar', verificarToken, verificarRol('Administrador'), formatoController.actualizarFormato);
router.get('/vigente', formatoController.obtenerFormatoVigente);

module.exports = router;
