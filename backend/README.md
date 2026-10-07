# Paz y Salvo Contractual SENA — Backend (GCCON-F-088)

API REST en **Node.js + Express + MongoDB** para la gestión del formato institucional
**GCCON-F-088** de paz y salvo contractual del SENA. Implementa autenticación segura,
cadena jerárquica de usuarios, registro contractual con inventario de bienes, validación
del supervisor, ronda de firmas por dependencia con criptografía (SHA-256), motor de PDF
(PDFKit), recuperación de contraseña, gestión de plantillas y auditoría.

---

## 1. Requisitos previos

- **Node.js** >= 18 (probado con v22)
- **MongoDB** corriendo en `mongodb://127.0.0.1:27017`
- Variables de entorno (`.env`)

```bash
cd backend
npm install
npm run dev          # arranque con nodemon
# o
npm start            # arranque con node

npm test             # suite de tests (Jest + supertest)

npm run seed:admin        # crea el Administrador inicial (idempotente)
npm run seed:supervisor   # crea un Supervisor de prueba
npm run migrar            # migra/limpieza de datos legacy
```

### Frontend (`frontend/`)

SPA en **Vue 3 + Quasar + Vite**. Se ejecuta en el puerto `5173` con proxy de `/api`
hacia el backend en `http://localhost:3000`.

```bash
cd frontend
npm install
npm run dev          # Vite dev server (http://localhost:5173)
npm run build        # genera dist/ para producción
```

### Variables de entorno (`.env`)

Copia `.env.example` a `.env` y configura:

```
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/pazysalvo_sena
JWT_SECRET=secreto_super_seguro_pazysalvo_2026
EMAIL_USER=        # correo Gmail para Nodemailer
EMAIL_PASS=        # contraseña de aplicación
FRONTEND_URL=http://localhost:3000   # opcional, usado en el enlace de recuperación
CORS_ORIGIN=http://localhost:3000    # lista blanca de orígenes (separada por comas)
RATE_LIMIT_MAX=10  # peticiones por ventana de 15 min en el login
```

> **Nota sobre transacciones:** las transacciones atómicas de MongoDB requieren un
> *replica set*. Si `mongod` corre en modo standalone, el backend usa automáticamente un
> fallback secuencial con compensación. Para habilitar transacciones reales, inicia:
> `mongod --replSet rs0` y ejecuta `rs.initiate()`.

---

## 2. Estructura del proyecto

```
pre_backend_proyect/
├── backend/                         # API REST (Node + Express + MongoDB)
│   ├── server.js                    # Punto de entrada (conexión + listen)
│   ├── .env                         # Configuración (no versionado)
│   ├── .env.example                 # Plantilla de variables de entorno
│   ├── scripts/
│   │   ├── seedAdmin.js             # Seed del Administrador inicial
│   │   ├── seedSupervisor.js        # Seed de un supervisor de prueba
│   │   └── migrarDatos.js           # Migración de datos legacy
│   ├── tests/
│   │   └── api.test.js              # Suite Jest + supertest
│   └── src/
│       ├── app.js                   # Aplicación Express (exportable para tests)
│       ├── config/
│       │   ├── db.js                # Conexión a MongoDB (mongoose)
│       │   └── swagger.js           # Documentación OpenAPI
│       ├── middlewares/
│       │   ├── authMiddleware.js    # verificarToken, verificarRol, verificarJerarquia
│       │   ├── errorHandler.js      # Manejo centralizado de errores
│       │   └── validarCampos.js     # Recolector de errores de express-validator
│       ├── utils/
│       │   ├── AppError.js          # Error operativo con código HTTP
│       │   ├── asyncHandler.js      # Envoltorio async para controladores
│       │   └── validarPassword.js   # Política de contraseñas
│       ├── models/                  # Esquemas de MongoDB
│       │   ├── Usuario.js
│       │   ├── Contrato.js
│       │   ├── BienEntregado.js
│       │   ├── DependenciaArea.js
│       │   ├── TrazabilidadFirma.js
│       │   ├── FormatoConfig.js
│       │   └── HistorialAuditoria.js
│       ├── controllers/             # Lógica de negocio por módulo
│       │   ├── authController.js
│       │   ├── usuarioController.js
│       │   ├── contratoController.js
│       │   ├── supervisionController.js
│       │   ├── dependenciaController.js
│       │   ├── firmasController.js
│       │   ├── formatoController.js
│       │   ├── reporteController.js
│       │   └── auditoriaController.js
│       ├── services/                # Lógica reutilizable
│       │   ├── emailService.js      # Nodemailer centralizado
│       │   ├── pdfService.js        # PDFKit + destrucción biométrica de firma
│       │   ├── formatoCache.js      # Caché en RAM de la plantilla vigente
│       │   └── auditoriaService.js  # Registro de trazabilidad (RNF-003)
│       └── routes/                  # Definición de endpoints
│           ├── authRoutes.js
│           ├── usuarioRoutes.js
│           ├── contratoRoutes.js
│           ├── supervisionRoutes.js
│           ├── dependenciaRoutes.js
│           ├── firmasRoutes.js
│           ├── formatoRoutes.js
│           └── auditoriaRoutes.js
└── frontend/                        # SPA en Vue 3 + Quasar + Vite
    ├── index.html
    ├── vite.config.js               # Proxy /api → http://localhost:3000
    ├── .env.example
    └── src/
        ├── App.vue
        ├── main.js
        ├── layouts/MainLayout.vue
        ├── router/index.js
        ├── constants/               # roles, demoAccounts, storage
        ├── services/                # Capa Axios (auth, contratos, dependencias...)
        └── pages/
            ├── LoginPage.vue
            ├── DashboardPage.vue
            ├── ContratosPage.vue
            ├── ContratoFormPage.vue
            ├── DependenciasPage.vue
            ├── UsuariosPage.vue
            └── FirmasPage.vue
```

---

## 3. Roles y cadena jerárquica

| Rol | Quién lo crea | Permisos clave |
|---|---|---|
| `Administrador` | (seed inicial) | Crear Supervisores, gestionar usuarios, actualizar plantilla, ver auditoría |
| `Supervisor` | Administrador | Crear Contratistas y Responsables de Área, gestionar dependencias, evaluar contratos | 
| `ResponsableArea` | Supervisor | Firmar/rechazar, ver solicitudes pendientes e historial |
| `Contratista` | Supervisor | Registrar contrato y bienes, consultar estado, descargar PDF, cambiar contraseña |

La jerarquía se valida con el middleware `verificarJerarquia` (`src/middlewares/authMiddleware.js`):

- **Administrador** → puede crear `Supervisor`.
- **Supervisor** → puede crear `Contratista` y `ResponsableArea`.
- Un rol **no puede crear** un rol de nivel igual o superior.

---

## 4. Tabla de endpoints

### Autenticación y seguridad

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/auth/login` | público | Login + bloqueo por 3 intentos (15 min) |
| POST | `/api/auth/recuperar` | público | Genera token efímero de recuperación |
| POST | `/api/auth/restablecer` | público | Restablece contraseña con token (body `{ token, nueva_password }`) |
| PUT | `/api/auth/cambiar-password` | autenticado | Cambio de contraseña (RF-015) |

### Usuarios

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/usuarios` | Admin / Supervisor | Creación jerárquica |
| GET | `/api/usuarios` | Admin / Supervisor | Listar (Supervisor solo ve los suyos) |
| GET | `/api/usuarios/:id` | Admin / Supervisor | Detalle |
| PATCH | `/api/usuarios/:id` | Admin / Supervisor | Actualizar datos (y rol, re-validado por jerarquía) |
| PATCH | `/api/usuarios/estado/:id` | Admin | Habilitar/deshabilitar en tiempo real |

### Contratos e inventario

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/contratos/nuevo` | Contratista | Crear contrato + bienes (estado `Borrador`) |
| GET | `/api/contratos/mis-solicitudes` | Contratista | Consultar mis solicitudes (RF-005) |
| GET | `/api/contratos` | Supervisor / Admin / ResponsableArea | Listar por rol |
| GET | `/api/contratos/:id` | dueño/supervisor/admin/responsable | Detalle + bienes |
| PUT | `/api/contratos/:id` | Contratista | Actualizar solo en `Borrador` (RF-002) |
| DELETE | `/api/contratos/:id` | Contratista | Cancelar contrato en `Borrador` (RF-002 esc.4) |
| DELETE | `/api/contratos/:id/bienes/:bienId` | Contratista | Eliminar un bien del inventario (RF-003 esc.4) |
| GET | `/api/contratos/:id/observaciones` | dueño/supervisor/admin | Observaciones del trámite (RF-014 esc.4) |
| PUT | `/api/contratos/evaluar/:id` | Supervisor | Evaluar (Flujo 3) |
| GET | `/api/contratos/:id/pdf` | Contratista / Admin | Descargar PDF (RF-010) |

### Dependencias (RF-012)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/dependencias` | Supervisor | Crear dependencia |
| GET | `/api/dependencias` | Supervisor / Admin | Listar |
| PUT | `/api/dependencias/:id` | Supervisor | Actualizar |
| POST | `/api/dependencias/:id/responsable` | Supervisor | Asignar responsable |

### Firmas (Flujo 4, RF-013)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/firmas/procesar` | ResponsableArea / Admin | Aprobar/rechazar con SHA-256 |
| GET | `/api/firmas/pendientes` | ResponsableArea / Admin | Solicitudes pendientes |
| GET | `/api/firmas/historial` | ResponsableArea / Admin | Historial gestionado |

### Formato (Flujo 6, RF-004)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| PUT | `/api/formatos/actualizar` | Admin | Actualizar plantilla (`upsert`) + limpiar caché |
| GET | `/api/formatos/vigente` | público | Versión vigente del formato |

### Auditoría (RNF-003)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/auditoria` | Admin | Trazabilidad de acciones |

---

## 5. Modelos y colecciones en MongoDB

| Colección | Modelo | Campos clave |
|---|---|---|
| `usuarios` | `Usuario` | `nombre_completo`, `correo_institucional`, `password_hash`, `rol`, `dependencia_id`, `supervisor_id`, `cargo`, `activo`, `intentos_fallidos`, `bloqueado_hasta`, `token_recuperacion`, `token_expiracion` |
| `contratos_gccon_f088` | `Contrato` | `numero_contrato`, `nombre_contratista`, `correo_contratista`, `dependencia` (ObjectId), `usuario`, `supervisor`, `estado`, `observaciones_supervisor`, `version_formato` |
| `bienes_entregados` | `BienEntregado` | `contrato_id`, `descripcion`, `codigo_inventario`, `cantidad`, `estado_bien` |
| `dependencias_areas` | `DependenciaArea` | `nombre_dependencia`, `activo`, `responsable_id` |
| `trazabilidad_firmas` | `TrazabilidadFirma` | `contrato_id`, `area_id`, `usuario_id`, `estado`, `observacion_rechazo`, `hash_verificacion`, `fecha_firma` |
| `formato_config` | `FormatoConfig` | `codigo_formato`, `numero_version`, `fecha_vigencia`, `texto_encabezado`, `campos_obligatorios` |
| `historial_auditoria` | `HistorialAuditoria` | `usuario_id`, `accion`, `entidad_afectada`, `detalles` |

### Estados del contrato

`Borrador → Pendiente de Firmas → Finalizado` (y vuelve a `Borrador` si es rechazado).

---

## 6. Seguridad y robustez

- **Rate limiting** (`express-rate-limit`): limita peticiones en `/api/auth/login` y
  `/api/auth/recuperar` (por IP, `RATE_LIMIT_MAX` por ventana de 15 min).
- **Helmet**: cabeceras HTTP de seguridad en toda la API.
- **CORS**: lista blanca de orígenes configurada con `CORS_ORIGIN`.
- **Política de contraseñas** (`src/utils/validarPassword.js`): mínimo 8 caracteres, una
  mayúscula, una minúscula y un número; aplicada en creación, restablecimiento y cambio.
- **Validación de entrada** (`express-validator`): en endpoints críticos (login, contrato+bienes,
  usuarios, firmas) con `src/middlewares/validarCampos.js`.
- **Manejo centralizado de errores** (`src/middlewares/errorHandler.js` + `src/utils/AppError.js`):
  errores de validación y duplicados con códigos HTTP consistentes.
- **Logging** (`morgan`): registro de peticiones HTTP.

## 7. Pruebas

Suite automatizada con **Jest + supertest** en `tests/api.test.js` (18 pruebas) usando una base
de datos de prueba `pazysalvo_sena_test`:

```bash
npm test
```

Cubre: login (éxito, credenciales inválidas, usuario deshabilitado, bloqueo por 3 intentos),
jerarquía de creación, política de contraseñas, creación de contrato y validación de bienes,
evaluación estricta del supervisor, firma y finalización, consulta de solicitudes, descarga de
PDF, recuperación/restablecimiento y cambio de contraseña.

## 8. Documentación de la API (Swagger)

Interfaz interactiva OpenAPI disponible en:

```
http://localhost:3000/api-docs
```

(Definida en `src/config/swagger.js`.)

---

## 9. Flujo de negocio (los 7 diagramas)

1. **Autenticación y bloqueos** (`/api/auth/login`): busca el correo, valida `bloqueado_hasta`,
   compara con `bcrypt.compare()`, acumula intentos (bloqueo de 15 min tras 3 fallos) y emite
   un JWT firmado con `id`, `rol`, `dependencia_id` y `supervisor_id`.
2. **Registro contractual e inventario** (`/api/contratos/nuevo`): valida campos y cada bien
   (`descripcion` + `codigo_inventario`), hereda la versión vigente del formato y guarda el
   contrato en `Borrador` con `insertMany` de bienes dentro de una transacción (o fallback).
3. **Validación del supervisor** (`/api/contratos/evaluar/:id`): exclusivo Supervisor, valida
   por cruce de IDs. Rechazo → vuelve a `Borrador` + correo. Aprobación → `Pendiente de Firmas`
   y abre un casillero por dependencia activa en `trazabilidad_firmas`.
4. **Dictamen de área** (`/api/firmas/procesar`): genera huella SHA-256
   (`contrato_id:jefe_id:timestamp`), cuenta pendientes; al llegar a 0 → `Finalizado` + PDF
   con PDFKit y destrucción biométrica de la imagen de firma en RAM.
5. **Recuperación de contraseña** (`/api/auth/recuperar` y `/api/auth/restablecer`): token
   efímero `crypto.randomBytes`, expiración de 15 min, cifrado bcrypt (10 saltos) y limpieza
   de tokens al finalizar.
6. **Gestión de plantilla** (`/api/formatos/actualizar`): `findOneAndUpdate` con `upsert: true`
   y limpieza de la caché en RAM para que los nuevos contratos hereden la versión.
7. **Control administrativo** (`/api/usuarios/estado/:id`): el middleware global consulta
   `findById` en cada petición y expulsa con HTTP 401 a usuarios con `activo: false`.

---

## 10. Registro de implementación (paso a paso)

### Fase 0 — Estabilización de los 4 diagramas

- `Usuario.js`: se agregaron `bloqueado_hasta`, `dependencia_id`, `supervisor_id`, `cargo`
  (el código ya los usaba pero Mongoose los descartaba por `strict: true`).
- `Contrato.js`: se añadió `Finalizado` al enum `estado`, `dependencia` pasó a `ObjectId`,
  y se agregaron `usuario` y `observaciones_supervisor`.
- `BienEntregado.js`: se agregó `estado_bien`.
- `DependenciaArea.js`: se agregó `responsable_id`.
- `contratoController.js`: los bienes ahora se guardan con `contrato_id` (antes `contrato`) y
  `estado_bien`; se valida `dependencia` como `ObjectId`; se asigna `supervisor` desde el token.
- `supervisionController.js`: se corrigió la consulta `{ activo: true }` (antes `activa`) y los
  casilleros se insertan con los campos reales (`contrato_id`, `area_id`, `estado`).
- `firmasController.js`: se consultan bienes por `contrato_id` y el área desde `dependencia_id`.
- `authController.js`: el JWT incluye `dependencia_id` y `supervisor_id`; se eliminaron los
  `console.log` de depuración.
- `.env`: se agregaron `EMAIL_USER` y `EMAIL_PASS`.

### Fase 1 — Cerrar los 7 diagramas

- `contratoController.js`: validación de `descripcion` y `codigo_inventario` por cada bien.
- `supervisionRoutes.js` + `supervisionController.js`: rol estricto `Supervisor`.
- `services/pdfService.js`: extracción de la generación de PDF y **destrucción biométrica**
  (`imgBuffer.fill(0)`) de la firma.
- `services/emailService.js`: Nodemailer centralizado.
- `Usuario.js`: `token_recuperacion` y `token_expiracion`.
- `authController.js` + `authRoutes.js`: `recuperar` y `restablecer`.
- `formatoController.js` + `formatoRoutes.js` + `services/formatoCache.js`: actualización en
  caliente con `upsert` + caché en RAM.
- `usuarioController.js` + `usuarioRoutes.js`: `PATCH /usuarios/estado/:id`.
- `authMiddleware.js`: consulta `findById` en cada petición (Flujo 7).
- `server.js`: montaje de `/api/formatos`.

### Fase 2 — Jerarquía de usuarios (RF-009, RF-011)

- `authMiddleware.js`: `verificarJerarquia` con el mapa `ROLES_CREABLES_POR_ROL`.
- `usuarioController.js`: `crearUsuario` (asigna `supervisor_id` automático), `obtenerUsuarios`
  (Supervisor solo ve los suyos), `obtenerUsuario`, `actualizarUsuario`.

### Fase 3 — Dependencias y responsables (RF-012)

- `dependenciaController.js` + `dependenciaRoutes.js`: CRUD de dependencias y asignación de
  responsable (vincula `responsable_id` y `dependencia_id` en ambos documentos).

### Fase 4 — Consultas, firma y PDF (RF-005, RF-010, RF-013, RF-014)

- `contratoController.js`: `misSolicitudes`, `listarContratos`, `obtenerContrato`,
  `actualizarContrato`.
- `firmasController.js`: `listarPendientes`, `listarHistorial`.
- `reporteController.js`: descarga del PDF (`GET /contratos/:id/pdf`).

### Fase 5 — Seguridad y auditoría (RF-015, RNF-003)

- `authController.js`: `cambiarPassword`.
- `auditoriaController.js` + `auditoriaRoutes.js` + `services/auditoriaService.js`: trazabilidad
  de acciones en `historial_auditoria` (hooks en contrato, evaluación, firma, usuarios, formato).

### Fase 6 — Arranque y datos (operación)

- `scripts/seedAdmin.js`: crea el Administrador inicial (idempotente). Resuelve que la jerarquía
  impide crear `Administrador` por API.
- `scripts/migrarDatos.js`: convierte `dependencia` de `String` a `ObjectId` en datos legacy y
  reporta bienes huérfanos.
- `.env.example`: plantilla documentada de variables de entorno.
- `server.js`: aviso al arranque si `EMAIL_USER`/`EMAIL_PASS` están vacíos.

### Fase 7 — Funcional pendiente (RF-002/003/009/014)

- `contratoController.js` + `contratoRoutes.js`: `cancelarContrato` (`DELETE /contratos/:id`),
  `eliminarBien` (`DELETE /contratos/:id/bienes/:bienId`) y `obtenerObservaciones`
  (`GET /contratos/:id/observaciones`).
- `usuarioController.js`: cambio de `rol` en `actualizarUsuario` re-validado con la jerarquía.

### Fase 8 — Seguridad

- `express-rate-limit` en login/recuperar; `helmet`; CORS con lista blanca; política de
  contraseñas (`utils/validarPassword.js`); `express-validator` en endpoints críticos.

### Fase 9 — Calidad y documentación

- Refactor a `src/app.js` (app exportable) + `server.js` (solo conexión y listen).
- `middlewares/errorHandler.js`, `utils/AppError.js`, `utils/asyncHandler.js`.
- Todos los controladores migrados a `asyncHandler` + `AppError` (sin `try/catch` repetido;
  los errores operativos se lanzan con código HTTP y los inesperados caen en 500 genérico).
- `morgan` para logging; `src/config/swagger.js` con documentación en `/api-docs`.
- Tests `tests/api.test.js` (Jest + supertest, 18 pruebas).
- Fix en `pdfService.js` para mostrar el nombre del área (no el ObjectId) en los hashes.

---

## 11. Verificación

- Sintaxis verificada con `node --check` en todos los archivos.
- **Suite automatizada**: `npm test` → 18/18 OK (Jest + supertest).
- **Smoke test end-to-end**: 31/31 OK cubriendo: login de los 4 roles, jerarquía de creación,
  CRUD de dependencias y asignación de responsable, validación de bienes, creación de contrato,
  consulta/actualización, evaluación estricta del supervisor, apertura de casilleros, firma con
  SHA-256, finalización + generación de PDF, descarga de PDF, recuperación y restablecimiento
  de contraseña, cambio de contraseña, actualización del formato y consulta de la versión
  vigente, auditoría, y expulsión en tiempo real de usuarios deshabilitados.
- Migración de datos legacy verificada (3 contratos con `dependencia` convertida a `ObjectId`).

---

## 12. Ejemplo rápido de uso

```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo_institucional":"juan.contratista@empresa.edu","password":"..."}'

# 2. Crear contrato (token de Contratista)
curl -X POST http://localhost:3000/api/contratos/nuevo \
  -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN" \
  -d '{"numero":"CT-2026-100","telefono":"3001112233","dependencia":"<ObjectId>",
       "bienes":[{"descripcion":"Laptop","codigo_inventario":"INV-001","estado_bien":"Bueno"}]}'

# 3. Evaluar (token de Supervisor)
curl -X PUT http://localhost:3000/api/contratos/evaluar/<id> \
  -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN" \
  -d '{"aprobado":true}'

# 4. Firmar (token de Responsable de Área)
curl -X POST http://localhost:3000/api/firmas/procesar \
  -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN" \
  -d '{"contratoId":"<id>","accion":"Aprobar"}'
```
