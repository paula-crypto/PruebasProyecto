const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');
const firmasController = require('../controllers/firmasController');
const validarCampos = require('../middlewares/validarCampos');

// Validación de entrada del dictamen de área (Flujo 4)
const validarFirma = [
  body('contratoId').trim().notEmpty().withMessage('El contratoId es obligatorio.'),
  body('accion').isIn(['Aprobar', 'Rechazar']).withMessage('La acción debe ser "Aprobar" o "Rechazar".'),
  validarCampos
];

// Diagrama 4: procesar aprobación/rechazo de un área (ResponsableArea, Administrador o Supervisor)
router.post('/procesar', verificarToken, verificarRol('ResponsableArea', 'Administrador', 'Supervisor'), validarFirma, firmasController.procesarFirma);

// RF-013: listar solicitudes pendientes y historial de firmas (Exclusivo ResponsableArea)
router.get('/pendientes', verificarToken, verificarRol('ResponsableArea'), firmasController.listarPendientes);
router.get('/historial', verificarToken, verificarRol('ResponsableArea'), firmasController.listarHistorial);

module.exports = router;
