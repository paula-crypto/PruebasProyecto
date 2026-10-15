# HISTORIAL INTEGRAL DE CAMBIOS Y EVOLUCIÓN DEL PROYECTO
## Sistema de Gestión y Expedición de Paz y Salvo Contractual (SENA GCCON-F-088)

---

### Ficha Técnica del Proyecto
- **Institución:** Servicio Nacional de Aprendizaje (SENA)
- **Formato Oficial:** GCCON-F-088 (Constancia de Paz y Salvo Contractual)
- **Frontend:** Vue 3 (Composition API), Quasar Framework v2.23 (SPA), Pinia, Vite v8
- **Backend:** Node.js, Express, Mongoose ODM
- **Base de Datos:** MongoDB Atlas (Cluster Cloud)
- **Despliegue e Infraestructura:**
  - Backend API: Render (`https://api-paz-y-salvo.onrender.com` / `http://localhost:3000`)
  - Frontend SPA: Vercel y Quasar Serve
  - Repositorio Principal: `https://github.com/paula-crypto/PruebasProyecto.git` (rama `main`)
  - Repositorio Espejo: `https://github.com/jeffersonarley/backen_paz_y_salvo.git` (rama `frontend-paula`)

---

## 1. Cronología Detallada de Cambios por Fecha

```mermaid
timeline
    title Cronología de Evolución del Proyecto Paz y Salvo SENA
    section Fase 1: Arquitectura Base
        06 Octubre 2026 : Inicialización del proyecto : Despliegue en Vercel y Render : Configuración CORS : Suite de pruebas TestSprite (55 casos)
        07 Octubre 2026 : Expansión PRD : 70 casos de prueba independientes
    section Fase 2: Formato GCCON-F-088 y Firmas
        11 Octubre 2026 : Plantillas dinámicas de áreas : Restricción estricta de firmas : Control de duplicados en Atlas : Corrección Franklin Chacón
    section Fase 3: Impresión y Pruebas Automatizadas
        13 Octubre 2026 : Adaptación cookies TestSprite : Impresión exacta a 1 página Carta : Eliminación bordes punteados : Restauración sección faltantes
    section Fase 4: Rendimiento y Aislamiento de Roles
        14 Octubre 2026 : Optimización bulk insert (7s a 1.2s) : Solicitudes recientes en la cima : Aislamiento estricto Contratista/Supervisor : Limpieza visual barra superior
```

---

### [06 de Octubre de 2026] - Inicialización, Arquitectura y Suite de Pruebas

#### 1. Estructura Base del Proyecto
- **Descripción:** Puesta en marcha de la estructura completa del aplicativo SPA en Quasar y la API REST en Express.
- **Acciones Realizadas:**
  - Creación de rutas de navegación principales (`Dashboard`, `Solicitudes`, `Nueva Solicitud`, `Firmas`, `Certificado PDF`, `Contratistas`, `Supervisores`, `Dependencias`, `Usuarios`).
  - Configuración de `vercel.json` para resolución de rutas SPA sin errores 404 en recargas de página.
  - Implementación de políticas CORS dinámicas en el backend para permitir conexiones seguras desde cualquier subdominio de Vercel y entornos locales.
- **Commits:**
  - `3df1cf5`: *first commit: Sistema de Paz y Salvo SENA GCCON-F-088*
  - `44c0002`: *chore(deploy): agregar vercel.json para rutas de Quasar SPA en Vercel*
  - `07e904f`: *fix(cors): permitir dinamicamente todos los subdominios de Vercel y clientes web*

#### 2. Especificación PRD y Catálogo para Pruebas Automatizadas
- **Descripción:** Definición formal del Documento de Requisitos del Producto (`PRD.md`) y preparación del catálogo de credenciales para testing automatizado en la plataforma TestSprite.
- **Acciones Realizadas:**
  - Documentación de los 4 roles del sistema: Administrador, Supervisor, Responsable de Área y Contratista.
  - Creación de la suite inicial de 55 casos de prueba funcionales e integrados (autenticación, validación de formularios, flujo de firmas y renderizado de certificado).
- **Commits:**
  - `8ba0a3d`: *docs(prd): actualizar PRD.md con catalogo completo de roles, credenciales y casos para TestSprite*
  - `7844074`: *docs(prd): expandir suite completa de 55 casos de prueba formalizados para TestSprite*

---

### [07 de Octubre de 2026] - Cobertura de Calidad y Pruebas Extendidas

#### 1. Expansión Formal de Casos de Prueba
- **Descripción:** Ampliación del catálogo de aseguramiento de calidad exigido para la plataforma de evaluación continua.
- **Acciones Realizadas:**
  - Formalización y desglose de 70 casos de prueba independientes con precondiciones, pasos de ejecución y resultados esperados para garantizar un umbral superior a 50 ejecuciones exitosas en TestSprite.
- **Commits:**
  - `e70bb67`: *docs(prd): expandir formalmente a 70 casos de prueba independientes para asegurar mas de 50 en TestSprite*

---

### [11 de Octubre de 2026] - Formato Oficial GCCON-F-088, Plantillas Dinámicas y Seguridad de Firmas

#### 1. Configuración Dinámica de Plantillas y Dependencias
- **Descripción:** Los contratos en el SENA varían según su objeto: algunas dependencias aplican y otras no aplican (N/A).
- **Acciones Realizadas:**
  - Creación del modal interactivo *"Plantilla y Firmantes"* (`abrirModalPlantillaFirmas`).
  - Capacidad de activar o marcar dependencias como `No Aplica` (N/A) por contrato individual.
  - Selector dinámico de año/vigencia contractual.
  - Botón distintivo con color `teal-8` para la gestión de plantillas.
- **Commits:**
  - `3d7bb22`: *feat: configuracion dinamica de plantillas GCCON-F-088, dependencias N/A y asignacion de supervisor y firmantes*
  - `74bc27d`: *fix(ui): mejorar visibilidad de boton Plantilla y Firmantes con teal-8 y eliminar chip En Revision*
  - `ed6dab2`: *fix: mostrar nombre en desactivar dependencias, selector de vigencia/año por contrato y resolver identificacion y datos en certificado PDF GCCON-F-088*

#### 2. Restricción Estricta de Permisos de Firma
- **Descripción:** Se detectó que la interfaz permitía a contratistas interactuar con casillas reservadas para evaluadores.
- **Acciones Realizadas:**
  - Restricción absoluta para que las 13 dependencias y la fila 14 (Supervisión) solo puedan ser firmadas por usuarios con rol `RESPONSABLE_AREA` y `SUPERVISOR`.
  - El rol `CONTRATISTA` quedó limitado exclusivamente al recuadro final de recibido/paz y salvo del contratista.
  - Bloqueo de firmas si la solicitud se encuentra en estado `Rechazado` con aviso explicativo.
- **Commits:**
  - `31ee0b5`: *fix(firmas): restringir firmas de dependencias exclusivamente a areas y supervisores, excluyendo contratista*
  - `527ed1c`: *fix(permisos): restringir plantillas y edicion de supervisor a contratistas*

#### 3. Persistencia sin Duplicados y Corrección de Identidad Institucional
- **Descripción:** Al editar campos como ciudad, dirección o supervisor, se generaban registros duplicados en el listado local.
- **Acciones Realizadas:**
  - Corrección del algoritmo de mapeo y unificación en `useSolicitudesStore.js` mediante indexación por `_id` y número de contrato.
  - Corrección de la cuenta `responsable@gccon.com`, asignándole la identidad oficial correspondiente a la plantilla SENA: **Franklin Rolando Chacon Lopez** (Responsable de Gestión de TIC).
- **Commits:**
  - `4ef470d`: *fix: evitar duplicacion de solicitudes al editar ciudad/direccion/contrato y sincronizar campos con Atlas*
  - `0e47284`: *fix: sincronizar forzosamente supervisor del contrato y permitir editar supervisor en dialogoEditarDatos*
  - `641b155`: *fix(auth): corregir nombre de responsable@gccon.com a Franklin Rolando Chacon Lopez coincidiendo con GCCON-F-088*

---

### [13 de Octubre de 2026] - Fidelidad de Impresión, Soporte TestSprite y Estilos

#### 1. Adaptación para Pruebas Automatizadas en Producción
- **Descripción:** La suite TestSprite requería atributos HTML estándar y soporte de cookies de sesión para la captura de credenciales y navegación en la nube.
- **Acciones Realizadas:**
  - Conexión de variables de entorno hacia el backend en Render.
  - Inclusión de atributos `name`, `id` y `for` en las etiquetas del formulario de Login.
  - Emisión de cookies de sesión (`auth_token`, `token`, `session`) para persistencia segura.
- **Commits:**
  - `fe692e5`: *fix(auth): conectar API a Render en producción, guardar token en fallback y agregar atributos estándar a inputs de login para TestSprite*
  - `27489f5`: *fix(auth): agregar soporte de cookies de sesion y for attribute en inputs para captura de credenciales en TestSprite*

#### 2. Ajuste Milimétrico de Impresión (Formato GCCON-F-088 a 1 Página Carta)
- **Descripción:** El formato oficial no debe desbordarse a una segunda página ni dejar espacios muertos al momento de imprimir o generar el PDF.
- **Acciones Realizadas:**
  - Reemplazo de bordes punteados por líneas sólidas continuas de `1px solid #000` conforme a la norma técnica del SENA.
  - Escalado y distribución proporcional de las 14 filas de dependencias, el recuadro de bienes entregados y las firmas.
  - Restauración exacta del bloque de observaciones, faltantes y causales de terminación contractual.
- **Commits:**
  - `513089b`: *fix(print): ajustar tamanio y proporciones de impresion a 1 sola pagina exacta segun formato Excel GCCON-F-088*
  - `ceb82f5`: *fix(print): asegurar que impresion mantenga exactamente el mismo tamano y proporciones de la vista en pantalla*
  - `83d7aaf`: *fix(print): ampliar filas, recuadro de faltantes y firmas para llenar la hoja carta/A4 elegantemente sin espacios vacios*
  - `b6c39e4`: *fix(print): cambiar bordes punteados por lineas solidas continuas en datos y formato*
  - `cc7cdaf`: *fix(format): restaurar exactamente la seccion inferior original de faltantes y otros*

---

### [14 de Octubre de 2026] - Rendimiento Atlas, Aislamiento de Roles y Refinamiento Visual

#### 1. Optimización Extrema del Registro de Contratos (De 7.05s a 1.2s)
- **Problema:** Al crear una nueva solicitud contractual, la pantalla tardaba más de 7 segundos en guardar.
- **Causa Raíz:** En `contratoController.js`, el backend ejecutaba un bucle secuencial que consultaba e insertaba área por área en MongoDB Atlas (más de 15 consultas individuales) con intentos fallidos de transacciones distribuidas en clusters no configurados.
- **Solución Implementada:**
  - Sustitución del bucle secuencial por inserción masiva (`insertMany`) atómica de las áreas de trazabilidad.
  - Reemplazo del fallback lento por guardado directo de alta velocidad (`nuevoContrato.save()` + `BienEntregado.insertMany()`).
  - Tiempo de respuesta reducido en más del **82%** (medición verificada: 1202 ms).
- **Commit:**
  - `ca34638`: *fix: optimizar creacion de contratos con insercion masiva y garantizar visibilidad y nombres en tabla de solicitudes*

#### 2. Posicionamiento Prioritario de Nuevas Solicitudes
- **Requerimiento:** Al registrar una nueva solicitud, el usuario debe verla de inmediato en la primera fila de la tabla sin tener que buscarla.
- **Solución Implementada:**
  - Función `ordenarPorMasReciente` en `useSolicitudesStore.js` y `SolicitudesPage.vue`.
  - Asignación de timestamp de creación y etiqueta visual verde (`Nueva`) junto al código de la solicitud.
  - Al guardar, la paginación de la tabla se reinicia a la página 1 (`page = 1`) y se limpia cualquier filtro de texto activo.
- **Commit:**
  - `b968d04`: *feat: posicionar solicitudes recien creadas en la cima de la tabla y marcar con badge Nueva*

#### 3. Aislamiento Estricto de Datos por Contratista y Supervisor
- **Problema:** Al iniciar sesión con diferentes cuentas de contratista aparecían las mismas solicitudes compartidas, y los supervisores veían contratos ajenos por coincidencia de dependencia.
- **Causa Raíz:**
  1. Todos los contratos traídos de Atlas tenían la propiedad `creadoEnSesion: true`, burlando el filtro por contratista.
  2. `sessionStorage` guardaba las solicitudes creadas de forma global sin asociarlas al usuario autenticado.
  3. El filtro de supervisor evaluaba la dependencia en lugar del supervisor asignado.
- **Solución Implementada:**
  - **Contratistas:** Cada contratista ve única y exclusivamente sus contratos (por documento, correo, número de contrato o ID). Las solicitudes creadas en sesión se aíslan bajo la clave `solicitudes_creadas_${usuarioId}`.
  - **Supervisores:** Cada supervisor ve única y exclusivamente los contratos donde figura como responsable asignado o de los contratistas a su cargo (ej. Dra. Ana María Gómez solo ve a María Fernanda Gómez; Ing. Fernando Ramírez solo ve a Diego Morales; Ing. Carlos Supervisor ve a sus contratistas asignados).
  - **Backend:** En `crearContrato` y `listarContratos`, se almacena y consulta el `supervisor_id` resuelto, permitiendo filtrar desde la base de datos.
  - **Cierre de Sesión:** `authStore.logout()` purga todas las sesiones temporales para que al cambiar de cuenta nunca se filtren datos residuales.
- **Commit:**
  - `8680931`: *fix: aislar solicitudes por contratista y vincular contratistas con sus respectivos supervisores*

#### 4. Limpieza Visual de la Barra Superior de Acciones
- **Problema:** En la vista del certificado, los botones superiores *"Firmar Mi Área"* (para responsables de área) y *"Firmar como Contratista"* (para contratistas) recargaban la barra de herramientas y se veían amontonados.
- **Solución Implementada:**
  - Remoción de ambos botones de la barra superior en `CertificadoPdfPage.vue`.
  - La firma de cada dependencia se realiza de forma natural y directa haciendo clic en `+ firmar` en su respectiva fila del documento.
  - La firma del contratista se estampa directamente en su recuadro final en el cuerpo del formato.
  - La barra superior queda uniforme y espaciada con los botones de acción global: `VOLVER`, `PLANTILLA Y FIRMANTES`, `EDITAR FORMATO` e `IMPRIMIR`.
- **Commit:**
  - `8f09d48`: *style: remover botones de firmar en barra superior para responsable de area y contratista*

---

## 2. Matriz de Roles y Permisos Implementada

| Rol | Permiso en Solicitudes | Permiso en Plantillas | Permiso de Firma | Acciones en Certificado PDF |
| :--- | :--- | :--- | :--- | :--- |
| **CONTRATISTA** | Solo visualiza sus propios contratos | Denegado (No editable) | Exclusivo en su recuadro final de paz y salvo | Ver formato, editar datos propios, imprimir |
| **SUPERVISOR** | Visualiza contratos asignados a su supervisión | Permitido (Configurar áreas que aplican / firmantes) | Firma de Supervisión (Fila 14) y dependencias asignadas | Plantilla, editar causal/fechas, imprimir borrador/oficial |
| **RESPONSABLE_AREA** | Visualiza solicitudes con firmas pendientes en su área | Lectura de plantilla | Firma oficial de su dependencia técnica (Filas 1 a 13) | Firmar casilla de su área (`+ firmar`), imprimir |
| **ADMINISTRADOR** | Control total de todas las solicitudes institucionales | Permitido (Control global) | Puede validar y gestionar cualquier firma | Todas las acciones habilitadas |

---

## 3. Estado de Despliegue y Repositorios

- **Backend:** Node.js Express en puerto local 3000 y Render Cloud.
- **Frontend:** SPA Quasar compilado sin errores de linter ni dependencias circulares (`Build Succeeded`).
- **Sincronización:**
  - Repositorio `https://github.com/paula-crypto/PruebasProyecto.git` (rama `main` - Commit `8f09d48`).
  - Repositorio `https://github.com/jeffersonarley/backen_paz_y_salvo.git` (rama `frontend-paula` - Commit `db28dfa`).
