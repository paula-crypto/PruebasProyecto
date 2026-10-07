const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const contratoController = require('../controllers/contratoController');
const reporteController = require('../controllers/reporteController');

const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');
const validarCampos = require('../middlewares/validarCampos');

// Validación de entrada del registro contractual (Flujo 2)
const validarContrato = [
  body('numero').trim().notEmpty().withMessage('El número de contrato es obligatorio.'),
  validarCampos
];

// Diagrama 2: crear contrato e inventario (Contratista, Supervisor o Administrador)
router.post('/nuevo', verificarToken, verificarRol('Contratista', 'Supervisor', 'Administrador'), validarContrato, contratoController.crearContrato);
router.post('/', verificarToken, verificarRol('Contratista', 'Supervisor', 'Administrador'), validarContrato, contratoController.crearContrato);

// RF-005: consultar mis solicitudes (Contratista)
router.get('/mis-solicitudes', verificarToken, verificarRol('Contratista'), contratoController.misSolicitudes);

// RF-010: descargar PDF (Contratista, Administrador, Supervisor, ResponsableArea)
router.get('/:id/pdf', verificarToken, verificarRol('Contratista', 'Administrador', 'Supervisor', 'ResponsableArea'), reporteController.descargarPdf);

// RF-014: consultar observaciones del trámite
router.get('/:id/observaciones', verificarToken, contratoController.obtenerObservaciones);

// RF-003: eliminar un bien del inventario (Contratista, en Borrador)
router.delete('/:id/bienes/:bienId', verificarToken, verificarRol('Contratista'), contratoController.eliminarBien);

// Listar contratos por rol (Supervisor / Admin / ResponsableArea / Contratista)
router.get('/', verificarToken, verificarRol('Supervisor', 'Administrador', 'ResponsableArea', 'Contratista'), contratoController.listarContratos);

// RF-002: cancelar contrato en Borrador
router.delete('/:id', verificarToken, verificarRol('Contratista'), contratoController.cancelarContrato);

// Obtener detalle y actualizar (RF-002)
router.get('/:id', verificarToken, contratoController.obtenerContrato);
router.put('/:id', verificarToken, verificarRol('Contratista', 'Supervisor', 'Administrador', 'ResponsableArea'), contratoController.actualizarContrato);

module.exports = router;
