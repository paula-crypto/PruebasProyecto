const swaggerUi = require('swagger-ui-express');

// Documentación OpenAPI de la API Paz y Salvo SENA (GCCON-F-088)
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'API Paz y Salvo Contractual SENA (GCCON-F-088)',
    version: '1.0.0',
    description:
      'Gestión de paz y salvo contractual: autenticación segura, cadena jerárquica de usuarios, registro contractual con inventario, validación del supervisor, ronda de firmas con SHA-256, motor PDF, recuperación de contraseña y auditoría.'
  },
  servers: [{ url: 'http://localhost:3000' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
    }
  },
  paths: {
    '/api/auth/login': {
      post: {
        summary: 'Iniciar sesión (Flujo 1)',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { correo_institucional: { type: 'string' }, password: { type: 'string' } } } } }
        },
        responses: { 200: { description: 'Token JWT + usuario' }, 401: { description: 'Credenciales inválidas' }, 403: { description: 'Cuenta bloqueada' } }
      }
    },
    '/api/auth/recuperar': {
      post: { summary: 'Solicitar recuperación de contraseña (Flujo 5)', tags: ['Auth'] }
    },
    '/api/auth/restablecer': {
      post: { summary: 'Restablecer contraseña con token', tags: ['Auth'] }
    },
    '/api/auth/cambiar-password': {
      put: { summary: 'Cambiar contraseña (RF-015)', tags: ['Auth'], security: [{ bearerAuth: [] }] }
    },
    '/api/usuarios': {
      post: { summary: 'Crear usuario (jerárquico)', tags: ['Usuarios'], security: [{ bearerAuth: [] }] },
      get: { summary: 'Listar usuarios', tags: ['Usuarios'], security: [{ bearerAuth: [] }] }
    },
    '/api/usuarios/estado/{id}': {
      patch: { summary: 'Habilitar/deshabilitar usuario (Flujo 7)', tags: ['Usuarios'], security: [{ bearerAuth: [] }] }
    },
    '/api/contratos/nuevo': {
      post: { summary: 'Registrar contrato e inventario (Flujo 2)', tags: ['Contratos'], security: [{ bearerAuth: [] }] }
    },
    '/api/contratos/mis-solicitudes': {
      get: { summary: 'Mis solicitudes (RF-005)', tags: ['Contratos'], security: [{ bearerAuth: [] }] }
    },
    '/api/contratos/{id}': {
      get: { summary: 'Detalle de contrato', tags: ['Contratos'], security: [{ bearerAuth: [] }] },
      put: { summary: 'Actualizar contrato en Borrador', tags: ['Contratos'], security: [{ bearerAuth: [] }] },
      delete: { summary: 'Cancelar contrato en Borrador', tags: ['Contratos'], security: [{ bearerAuth: [] }] }
    },
    '/api/contratos/{id}/bienes/{bienId}': {
      delete: { summary: 'Eliminar bien del inventario', tags: ['Contratos'], security: [{ bearerAuth: [] }] }
    },
    '/api/contratos/{id}/observaciones': {
      get: { summary: 'Observaciones del trámite', tags: ['Contratos'], security: [{ bearerAuth: [] }] }
    },
    '/api/contratos/{id}/pdf': {
      get: { summary: 'Descargar PDF (RF-010)', tags: ['Contratos'], security: [{ bearerAuth: [] }] }
    },
    '/api/contratos/evaluar/{id}': {
      put: { summary: 'Evaluar contrato (Flujo 3)', tags: ['Supervisión'], security: [{ bearerAuth: [] }] }
    },
    '/api/dependencias': {
      post: { summary: 'Crear dependencia (RF-012)', tags: ['Dependencias'], security: [{ bearerAuth: [] }] },
      get: { summary: 'Listar dependencias', tags: ['Dependencias'], security: [{ bearerAuth: [] }] }
    },
    '/api/dependencias/{id}/responsable': {
      post: { summary: 'Asignar responsable de área', tags: ['Dependencias'], security: [{ bearerAuth: [] }] }
    },
    '/api/firmas/procesar': {
      post: { summary: 'Aprobar/rechazar firma (Flujo 4)', tags: ['Firmas'], security: [{ bearerAuth: [] }] }
    },
    '/api/firmas/pendientes': {
      get: { summary: 'Solicitudes de firma pendientes (RF-013)', tags: ['Firmas'], security: [{ bearerAuth: [] }] }
    },
    '/api/firmas/historial': {
      get: { summary: 'Historial de firmas', tags: ['Firmas'], security: [{ bearerAuth: [] }] }
    },
    '/api/formatos/actualizar': {
      put: { summary: 'Actualizar plantilla GCCON-F-088 (Flujo 6)', tags: ['Formato'], security: [{ bearerAuth: [] }] }
    },
    '/api/formatos/vigente': {
      get: { summary: 'Versión vigente del formato (RF-004)', tags: ['Formato'] }
    },
    '/api/auditoria': {
      get: { summary: 'Trazabilidad de acciones (RNF-003)', tags: ['Auditoría'], security: [{ bearerAuth: [] }] }
    }
  }
};

module.exports = { swaggerUi, swaggerDocument };
