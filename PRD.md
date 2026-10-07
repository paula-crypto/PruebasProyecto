# PRD: Sistema de Gestión de Paz y Salvo Contractual (SENA GCCON-F-088)
## Especificación de Requisitos de Producto y Matriz Maestra de 70 Casos de Prueba (TestSprite)

**Versión:** 3.0  
**Fecha:** Octubre 2026  
**Entorno de Ejecución:** Producción / Staging  
**Frontend URL:** `https://pruebasproyecto-frontend.vercel.app`  
**Backend API URL:** `https://api-paz-y-salvo.onrender.com/api`  
**Base de Datos:** MongoDB Atlas Cluster (`pazysalvo_sena`)  
**Estándar Oficial:** Formato Institucional SENA GCCON-F-088  
**Objetivo de Cobertura en TestSprite:** Mínimo garantizado $\ge 50$ pruebas ejecutables (70 casos formalizados).

---

## 1. Visión General del Producto y Objetivos

### 1.1 Declaración del Problema y Solución
El trámite de liquidación y expedición del formato institucional **GCCON-F-088** (*"Entrega de Bienes e Información de Ejecución Contractual por el Contratista"*) en el Centro Agroturístico San Gil - Regional Santander se realizaba de manera itinerante en papel, tardando más de 15 días y presentando riesgos de suplantación.

El **Sistema de Paz y Salvo SENA GCCON-F-088** es una plataforma web progresiva (Vue 3, Quasar, Node.js, Express, MongoDB Atlas) que automatiza el ciclo completo:
1. Radicación digital por el contratista con validación estricta de su cédula y vigencia anual (`CNT-YYYY-XXX`).
2. Cuadrícula oficial de 14 dependencias con validación RBAC por titularidad de casilla.
3. Control de retención y alertas por bienes pendientes de devolución.
4. Firma final del supervisor en Fila 14 y exportación a PDF idéntico al estándar SENA.

---

## 2. Catálogo Maestro de Roles y Credenciales de Prueba

Todos los usuarios listados a continuación están activos en MongoDB Atlas y disponibles para la ejecución de pruebas automatizadas:

| # | Rol del Sistema | Nombre del Funcionario | Correo Electrónico | Contraseña | Cargo / Dependencia | Cédula / Documento | Casilla / Alcance |
|:---:|:---|:---|:---|:---:|:---|:---:|:---:|
| **1** | `ADMINISTRADOR` | Administrador General | `admin@gccon.com` | `admin` *(o `Admin1234!`)* | Administrador del Sistema | `1095000001` | Todas las áreas |
| **2** | `ADMINISTRADOR` | Paula Administradora | `paula.admin@gccon.com` | `123` | Coordinadora Aseguramiento | `1095000002` | Todas las áreas |
| **3** | `SUPERVISOR` | Ing. Carlos Supervisor | `supervisor@gccon.com` | `super` | Supervisor de Contratos TIC | `1095000003` | Fila 14 (Supervisor) |
| **4** | `SUPERVISOR` | Dra. Ana María Gómez | `agomez@sena.edu.co` | `123` | Supervisora Senior | `1095000004` | Fila 14 (Supervisor) |
| **5** | `SUPERVISOR` | Ing. Fernando Ramírez | `f.ramirez@sena.edu.co` | `123` | Supervisor Infraestructura | `1095000005` | Fila 14 (Supervisor) |
| **6** | `CONTRATISTA` | Carlos Eduardo Mendoza | `carlos.mendoza@email.com` | `123` | Consultor en Redes | `1097890123` | `CNT-2026-042` |
| **7** | `CONTRATISTA` | Laura Andrea Contratista | `contratista@gccon.com` | `123` | Especialista en Soporte | `1095432189` | `CNT-2026-014` |
| **8** | `CONTRATISTA` | Juan Carlos Pérez | `juan.perez@correo.com` | `123` | Desarrollador Full-Stack | `1098765432` | `CNT-2025-088` |
| **9** | `CONTRATISTA` | María Fernanda Gómez | `maria.gomez@correo.com` | `123` | Instructora Telemática | `1094321765` | `CNT-2026-029` |
| **10** | `CONTRATISTA` | Diego Morales Castro | `diego.morales@correo.com` | `123` | Técnico Mantenimiento | `1096543210` | `CNT-2026-055` |
| **11** | `RESPONSABLE_AREA` | Franklin Rolando Chacón | `franklin.chacon@sena.edu.co` | `123` | Gestión de TIC | `1095111001` | **Fila 01** |
| **12** | `RESPONSABLE_AREA` | Hilda Lucía Ramírez | `hilda.ramirez@sena.edu.co` | `123` | Admin. Documentos | `1095111002` | **Fila 02** |
| **13** | `RESPONSABLE_AREA` | Johon Fredy Sanabria | `johon.sanabria@sena.edu.co` | `123` | Coordinación Académica | `1095111003` | **Fila 03** |
| **14** | `RESPONSABLE_AREA` | Lic. Martha Almacén | `martha.almacen@sena.edu.co` | `123` | Almacén e Inventarios | `1095111004` | **Fila 04** |
| **15** | `RESPONSABLE_AREA` | Juan David Silva | `juan.silva@sena.edu.co` | `123` | Servicios Generales | `1095111005` | **Fila 05** |
| **16** | `RESPONSABLE_AREA` | Zaida Leny Melgarejo | `zaida.melgarejo@sena.edu.co` | `123` | Contabilidad | `1095111006` | **Fila 06** |
| **17** | `RESPONSABLE_AREA` | Nelcy Mabel Mayorga | `nelcy.mayorga@sena.edu.co` | `123` | Tesorería | `1095111007` | **Fila 07** |
| **18** | `RESPONSABLE_AREA` | Andrea Juliana Celis | `andrea.celis@sena.edu.co` | `123` | Biblioteca | `1095111008` | **Fila 08** |
| **19** | `RESPONSABLE_AREA` | Zaida Jeleidy García | `zaida.garcia@sena.edu.co` | `123` | Líder SIGA | `1095111009` | **Fila 09** |
| **20** | `RESPONSABLE_AREA` | Erika Johana Gómez | `erika.gomez@sena.edu.co` | `123` | Admin. Educativa | `1095111010` | **Fila 10** |
| **21** | `RESPONSABLE_AREA` | Nelson Fabián Duarte | `nelson.duarte@sena.edu.co` | `123` | Seguimiento Administrativo | `1095111011` | **Fila 11** |
| **22** | `RESPONSABLE_AREA` | Karen Andrea García | `karen.garcia@sena.edu.co` | `123` | Apoyo Etapa Productiva | `1095111012` | **Fila 12** |
| **23** | `RESPONSABLE_AREA` | Eileen Erlensi Hurtado | `eileen.hurtado@sena.edu.co` | `123` | Apoyo Novedades | `1095111013` | **Fila 13** |

---

## 3. Matriz Oficial de 14 Filas del Formato GCCON-F-088

| Fila | Área Institucional Evaluadora | Responsable Autorizado | Bienes y Compromisos Verificados |
|:---:|:---|:---|:---|
| **01** | Gestión de TIC | Franklin Rolando Chacón | Cuenta de correo, acceso a plataformas, laptops y periféricos |
| **02** | Administración de Documentos | Hilda Lucía Ramírez | Archivo de gestión, expedientes contractuales, correspondencia |
| **03** | Coordinación de Área / Académica | Johon Fredy Sanabria | Informes de ejecución, actas y cumplimiento de obligaciones |
| **04** | Almacén e Inventarios | Lic. Martha Almacén | Devolución de bienes muebles, equipos de cómputo y herramientas |
| **05** | Servicios Generales y Adquisiciones | Juan David Silva | Carnet institucional SENA, llaves y elementos de oficina |
| **06** | Contabilidad | Zaida Leny Melgarejo | Cuentas de cobro, causaciones, estampillas y retenciones |
| **07** | Tesorería | Nelcy Mabel Mayorga | Pagos efectivos, giros y pólizas de cumplimiento |
| **08** | Biblioteca | Andrea Juliana Celis | Libros prestados, llaves de casilleros y material bibliográfico |
| **09** | Líder SIGA | Zaida Jeleidy García | Procedimientos del Sistema Integrado de Gestión y Calidad |
| **10** | Administración Educativa | Erika Johana Gómez | Cierre de fichas, juicios evaluativos en Sofía Plus / Zajuna |
| **11** | Apoyo al Seguimiento Administrativo | Nelson Fabián Duarte | Control de tiempos, constancias y novedades del contrato |
| **12** | Apoyo Etapa Productiva | Karen Andrea García | Reportes y seguimientos a aprendices en etapa productiva |
| **13** | Apoyo a Procesos y Novedades | Eileen Erlensi Hurtado | Bitácoras finales y soportes administrativos del centro |
| **14** | Supervisor de Contrato | Ing. Carlos Supervisor | Revisión final integral y firma de expedición del Paz y Salvo |

---

## 4. Matriz Maestra de 70 Casos de Prueba (Suite Detallada para TestSprite)

### Módulo 1: Autenticación, Seguridad y Gestión de Sesión (Casos 01 al 10)

* **TC-001: Login Exitoso con Rol Administrador**
  * *Actor:* Administrador General (`admin@gccon.com` / `admin`).
  * *Pasos:* Ingresar credenciales en `#/login` y hacer clic en Ingresar.
  * *Resultado Esperado:* Respuesta HTTP 200, JWT almacenado en `localStorage(auth_token)`, redirección exitosa a `#/app/solicitudes`.

* **TC-002: Login Exitoso con Rol Supervisor**
  * *Actor:* Ing. Carlos Supervisor (`supervisor@gccon.com` / `super`).
  * *Pasos:* Ingresar credenciales en `#/login`.
  * *Resultado Esperado:* Sesión iniciada con rol `SUPERVISOR`, acceso a bandeja de contratos bajo supervisión.

* **TC-003: Login Exitoso con Rol Contratista**
  * *Actor:* Carlos Eduardo Mendoza (`carlos.mendoza@email.com` / `123`).
  * *Pasos:* Iniciar sesión en `#/login`.
  * *Resultado Esperado:* Sesión iniciada con rol `CONTRATISTA`, cargando cédula `1097890123` y contrato `CNT-2026-042`.

* **TC-004: Login Exitoso con Rol Responsable de Área (TIC)**
  * *Actor:* Franklin Rolando Chacón (`franklin.chacon@sena.edu.co` / `123`).
  * *Pasos:* Iniciar sesión en `#/login`.
  * *Resultado Esperado:* Sesión iniciada con rol `RESPONSABLE_AREA`, habilitado para firmar Fila 1 (TIC).

* **TC-005: Rechazo de Autenticación por Contraseña Incorrecta**
  * *Actor:* Usuario no autorizado (`admin@gccon.com` / `claveErronea999`).
  * *Pasos:* Intentar iniciar sesión con contraseña errónea.
  * *Resultado Esperado:* HTTP 401, mensaje *"Credenciales inválidas"*, no se genera token.

* **TC-006: Bloqueo Temporal de Cuenta tras 3 Intentos Fallidos Consecutivos**
  * *Actor:* Usuario bloqueable (`admin@gccon.com`).
  * *Pasos:* Enviar 3 solicitudes de login consecutivas con contraseña equivocada.
  * *Resultado Esperado:* HTTP 403, cuenta bloqueada por 15 minutos, mensaje *"Ha superado los 3 intentos fallidos"*.

* **TC-007: Solicitud de Recuperación de Contraseña con Correo Registrado**
  * *Actor:* Usuario solicitante (`carlos.mendoza@email.com`).
  * *Pasos:* Enviar `POST /api/auth/recuperar` con correo registrado.
  * *Resultado Esperado:* HTTP 200, token efímero de recuperación de 15 minutos generado en backend.

* **TC-008: Protección Anti-Enumeración en Recuperación de Contraseña**
  * *Actor:* Usuario atacante (`correo.no.existe@sena.edu.co`).
  * *Pasos:* Enviar solicitud de recuperación con correo inexistente.
  * *Resultado Esperado:* HTTP 200 con mensaje neutro institucional *"Si el correo existe, se ha enviado un enlace"*.

* **TC-009: Rechazo de Token de Recuperación Expirado o Manipulado**
  * *Actor:* Usuario con token caduco.
  * *Pasos:* Enviar `POST /api/auth/restablecer` con token vencido y nueva clave.
  * *Resultado Esperado:* HTTP 400 *"El enlace es inválido o ha expirado"*.

* **TC-010: Cierre de Sesión Completo y Purga de Almacenamiento Local**
  * *Actor:* Cualquier usuario autenticado.
  * *Pasos:* Clic en perfil de usuario y seleccionar "Cerrar Sesión".
  * *Resultado Esperado:* Eliminación inmediata de `auth_token` y `gccon_user` en `localStorage`, redirección obligatoria a `#/login`.

---

### Módulo 2: Control de Acceso Basado en Roles (RBAC) (Casos 11 al 20)

* **TC-011: Bloqueo de Acceso a Contratista en Gestión de Usuarios**
  * *Actor:* Contratista autenticado.
  * *Pasos:* Intentar navegar directamente a la URL `#/app/usuarios`.
  * *Resultado Esperado:* Redirección bloqueada por Route Guard a `#/app/solicitudes` o pantalla de permisos insuficientes.

* **TC-012: Bloqueo de Acceso a Contratista en Gestión de Supervisores**
  * *Actor:* Contratista autenticado.
  * *Pasos:* Intentar acceder a `#/app/supervisores`.
  * *Resultado Esperado:* Acceso denegado, menú lateral oculta la opción.

* **TC-013: Bloqueo de Acceso a Contratista en Configuración de Dependencias**
  * *Actor:* Contratista autenticado.
  * *Pasos:* Intentar acceder a `#/app/dependencias`.
  * *Resultado Esperado:* Acceso bloqueado.

* **TC-014: Visualización Restringida de Opciones de Menú para Rol Supervisor**
  * *Actor:* Supervisor autenticado.
  * *Pasos:* Verificar opciones del menú lateral.
  * *Resultado Esperado:* Visualiza Solicitudes, Contratistas y Reportes; no visualiza Administración Global de Usuarios ni logs del sistema.

* **TC-015: Bloqueo a Supervisor en Desactivación de Dependencias**
  * *Actor:* Supervisor autenticado.
  * *Pasos:* Intentar enviar `PATCH /api/dependencias/:id` para desactivar un área.
  * *Resultado Esperado:* HTTP 403 *"Acceso no autorizado"*.

* **TC-016: Acceso Autorizado de Responsable de Área a su Bandeja**
  * *Actor:* Responsable de Área autenticado.
  * *Pasos:* Navegar a `#/app/solicitudes`.
  * *Resultado Esperado:* Acceso permitido para revisar y firmar su área respectiva.

* **TC-017: Bloqueo a Responsable de Área en Creación de Nuevos Usuarios**
  * *Actor:* Responsable de Área autenticado.
  * *Pasos:* Enviar `POST /api/usuarios`.
  * *Resultado Esperado:* HTTP 403 *"Rol no autorizado para crear usuarios"*.

* **TC-018: Bloqueo de Peticiones a la API sin Cabecera de Autorización**
  * *Actor:* Cliente anónimo sin token.
  * *Pasos:* Enviar `GET /api/usuarios` omitiendo el header `Authorization`.
  * *Resultado Esperado:* Solicitud no autorizada o tratada bajo perfil seguro.

* **TC-019: Acceso Pleno de Administrador a Todos los Módulos**
  * *Actor:* Administrador General.
  * *Pasos:* Navegar a Usuarios, Supervisores, Contratistas, Dependencias y Solicitudes.
  * *Resultado Esperado:* Acceso 100% habilitado en todas las vistas y acciones CRUD.

* **TC-020: Expulsión de Sesión ante Token JWT Expirado (HTTP 401)**
  * *Actor:* Usuario con sesión de más de 8 horas.
  * *Pasos:* Realizar una petición con token expirado.
  * *Resultado Esperado:* Interceptor detecta HTTP 401, limpia localStorage y redirige a `#/login`.

---

### Módulo 3: Aislamiento y Privacidad de la Información (Casos 21 al 28)

* **TC-021: Contratista 1 Visualiza Únicamente sus Contratos Propios**
  * *Actor:* Carlos Eduardo Mendoza (`carlos.mendoza@email.com`).
  * *Pasos:* Cargar listado en `#/app/solicitudes`.
  * *Resultado Esperado:* La tabla muestra exclusivamente el contrato `CNT-2026-042`.

* **TC-022: Contratista 1 No Puede Ver Solicitudes de Contratista 2**
  * *Actor:* Carlos Eduardo Mendoza.
  * *Pasos:* Verificar listado en pantalla.
  * *Resultado Esperado:* El contrato `CNT-2026-014` de Laura Andrea Contratista no figura en la tabla ni en los datos de red.

* **TC-023: Filtro Automático por ID de Usuario en Backend para Contratistas**
  * *Actor:* Contratista autenticado.
  * *Pasos:* Ejecutar `GET /api/contratos`.
  * *Resultado Esperado:* El backend filtra por `req.usuario.id` retornando solo las solicitudes del titular.

* **TC-024: Bloqueo de Acceso Directo por URL a Solicitud de Otro Contratista**
  * *Actor:* Carlos Mendoza.
  * *Pasos:* Ingresar por barra de navegación a `#/app/solicitudes/:id` correspondiente al contrato de Laura Andrea.
  * *Resultado Esperado:* Notificación de error *"No tiene autorización para ver esta solicitud"*.

* **TC-025: Supervisor Visualiza Únicamente Contratos bajo su Asignación**
  * *Actor:* Ing. Carlos Supervisor.
  * *Pasos:* Cargar bandeja de solicitudes.
  * *Resultado Esperado:* Solo se listan solicitudes donde `supervisor_id` coincide con su identificador.

* **TC-026: Supervisor No Visualiza Contratos de Otros Supervisores**
  * *Actor:* Ing. Carlos Supervisor.
  * *Pasos:* Verificar tabla de solicitudes.
  * *Resultado Esperado:* Contratos asignados a Dra. Ana María Gómez no aparecen en su bandeja.

* **TC-027: Administrador Visualiza el Consolidado Global de Solicitudes**
  * *Actor:* Administrador General.
  * *Pasos:* Consultar `#/app/solicitudes`.
  * *Resultado Esperado:* Visualiza la totalidad de solicitudes radicadas en el centro formativo sin filtros restrictivos.

* **TC-028: Ocultamiento de Metadatos Sensibles entre Usuarios**
  * *Actor:* Contratista consultando contratos.
  * *Pasos:* Inspeccionar respuesta JSON de la API.
  * *Resultado Esperado:* Campos como `password_hash`, tokens y datos de auditoría interna no son expuestos.

---

### Módulo 4: Radicación y Creación de Solicitudes GCCON-F-088 (Casos 29 al 38)

* **TC-029: Radicación con Nomenclatura Anual Vigente (2026)**
  * *Actor:* Contratista (`contratista@gccon.com`).
  * *Pasos:* Crear nueva solicitud ingresando contrato con vigencia `CNT-2026-014`.
  * *Resultado Esperado:* Solicitud creada con prefijo anual correcto.

* **TC-030: Autocompletado Obligatorio de Cédula del Contratista**
  * *Actor:* Contratista.
  * *Pasos:* Abrir formulario de radicación.
  * *Resultado Esperado:* El campo Documento/Cédula se autocompleta con `1095432189` sin aparecer vacío ni con guión `—`.

* **TC-031: Validación de Campos Obligatorios en Radicación**
  * *Actor:* Contratista.
  * *Pasos:* Intentar radicar dejando vacío el número de contrato y la dependencia.
  * *Resultado Esperado:* El formulario marca campos en rojo y no permite el envío.

* **TC-032: Carga de Archivo Adjunto de Informe Final en Formato PDF**
  * *Actor:* Contratista.
  * *Pasos:* Seleccionar un archivo `informe_final.pdf` y adjuntarlo al formulario.
  * *Resultado Esperado:* El archivo es aceptado y se muestra el nombre con su tamaño en la UI.

* **TC-033: Rechazo de Formatos de Archivo No Permitidos (.exe, .zip)**
  * *Actor:* Contratista.
  * *Pasos:* Intentar subir un archivo `archivo.exe`.
  * *Resultado Esperado:* Alerta de validación: *"Solo se permiten documentos en formato PDF"*.

* **TC-034: Firma Manuscrita en Componente Canvas del Contratista**
  * *Actor:* Contratista.
  * *Pasos:* Realizar un trazo manuscrito en el lienzo táctil/ratón del modal de firma.
  * *Resultado Esperado:* El componente captura el trazo y lo serializa a imagen PNG transparente en Base64.

* **TC-035: Botón Limpiar Lienzo en Componente Canvas de Firma**
  * *Actor:* Contratista.
  * *Pasos:* Dibujar en el canvas y hacer clic en el botón "Limpiar".
  * *Resultado Esperado:* El lienzo se borra por completo y queda en blanco listo para un nuevo trazo.

* **TC-036: Bloqueo de Radicación con Firma Vacía en Canvas**
  * *Actor:* Contratista.
  * *Pasos:* Llenar el formulario pero omitir la firma del canvas, presionando "Radicar".
  * *Resultado Esperado:* Notificación de advertencia *"Debe estampar su firma para radicar la solicitud"*.

* **TC-037: Inicialización Automática de las 14 Casillas de Trazabilidad**
  * *Actor:* Backend al procesar la radicación.
  * *Pasos:* Completar la radicación de la solicitud.
  * *Resultado Esperado:* En la base de datos se crean automáticamente las 14 casillas en estado `Pendiente`.

* **TC-038: Estado Inicial de la Solicitud Establecido en "En revisión"**
  * *Actor:* Sistema.
  * *Pasos:* Consultar la solicitud recién creada.
  * *Resultado Esperado:* El campo `estado` muestra `"En revisión"`.

---

### Módulo 5: Circuito Oficial de Firmas en Cuadrícula (Filas 1 a 14) (Casos 39 al 52)

* **TC-039: Firma Exitosa en Fila 01 (Gestión de TIC)**
  * *Actor:* Franklin Rolando Chacón (`franklin.chacon@sena.edu.co`).
  * *Pasos:* Abrir solicitud y firmar en la Fila 01.
  * *Resultado Esperado:* Casilla 1 pasa a estado `Firmado`, registrando firma, nombre y fecha.

* **TC-040: Bloqueo de Firma Cruzada de Responsable TIC en Fila 04 (Almacén)**
  * *Actor:* Franklin Rolando Chacón (TIC).
  * *Pasos:* Intentar estampar firma en la Fila 04 correspondiente a Almacén e Inventarios.
  * *Resultado Esperado:* Botón bloqueado o alerta *"Esta casilla corresponde a Almacén e Inventarios"*.

* **TC-041: Firma Exitosa en Fila 02 (Administración de Documentos)**
  * *Actor:* Hilda Lucía Ramírez (`hilda.ramirez@sena.edu.co`).
  * *Pasos:* Firmar en la Fila 02.
  * *Resultado Esperado:* Casilla 2 actualizada a `Firmado`.

* **TC-042: Firma Exitosa en Fila 03 (Coordinación Académica)**
  * *Actor:* Johon Fredy Sanabria (`johon.sanabria@sena.edu.co`).
  * *Pasos:* Firmar en la Fila 03.
  * *Resultado Esperado:* Casilla 3 actualizada a `Firmado`.

* **TC-043: Firma Exitosa en Fila 04 (Almacén e Inventarios)**
  * *Actor:* Lic. Martha Almacén (`martha.almacen@sena.edu.co`).
  * *Pasos:* Firmar en la Fila 04.
  * *Resultado Esperado:* Casilla 4 actualizada a `Firmado`.

* **TC-044: Firma Exitosa en Fila 05 (Servicios Generales y Adquisiciones)**
  * *Actor:* Juan David Silva (`juan.silva@sena.edu.co`).
  * *Pasos:* Firmar en la Fila 05.
  * *Resultado Esperado:* Casilla 5 actualizada a `Firmado`.

* **TC-045: Firma Exitosa en Fila 06 (Contabilidad)**
  * *Actor:* Zaida Leny Melgarejo (`zaida.melgarejo@sena.edu.co`).
  * *Pasos:* Firmar en la Fila 06.
  * *Resultado Esperado:* Casilla 6 actualizada a `Firmado`.

* **TC-046: Firma Exitosa en Fila 07 (Tesorería)**
  * *Actor:* Nelcy Mabel Mayorga (`nelcy.mayorga@sena.edu.co`).
  * *Pasos:* Firmar en la Fila 07.
  * *Resultado Esperado:* Casilla 7 actualizada a `Firmado`.

* **TC-047: Firma Exitosa en Fila 08 (Biblioteca)**
  * *Actor:* Andrea Juliana Celis (`andrea.celis@sena.edu.co`).
  * *Pasos:* Firmar en la Fila 08.
  * *Resultado Esperado:* Casilla 8 actualizada a `Firmado`.

* **TC-048: Firma Exitosa en Fila 09 (Líder SIGA)**
  * *Actor:* Zaida Jeleidy García (`zaida.garcia@sena.edu.co`).
  * *Pasos:* Firmar en la Fila 09.
  * *Resultado Esperado:* Casilla 9 actualizada a `Firmado`.

* **TC-049: Firma Exitosa en Fila 10 (Administración Educativa)**
  * *Actor:* Erika Johana Gómez (`erika.gomez@sena.edu.co`).
  * *Pasos:* Firmar en la Fila 10.
  * *Resultado Esperado:* Casilla 10 actualizada a `Firmado`.

* **TC-050: Firmas en Filas 11, 12 y 13 (Seguimiento, Etapa Productiva y Novedades)**
  * *Actores:* Nelson Duarte, Karen García y Eileen Hurtado.
  * *Pasos:* Estampar firmas en las Filas 11, 12 y 13 respectivamente.
  * *Resultado Esperado:* Las 3 casillas quedan en estado `Firmado`.

* **TC-051: Bloqueo de Firma de Supervisor en Fila 14 si Hay Áreas Pendientes**
  * *Actor:* Ing. Carlos Supervisor.
  * *Pasos:* Intentar firmar Fila 14 cuando solo 10 de las 13 áreas previas han firmado.
  * *Resultado Esperado:* Notificación preventiva: *"No se puede liquidar hasta que las 13 áreas previas firmen"*.

* **TC-052: Firma Final de Supervisor en Fila 14 tras Completar Todas las Áreas**
  * *Actor:* Ing. Carlos Supervisor.
  * *Pasos:* Firmar la Fila 14 habiendo culminado las 13 dependencias anteriores.
  * *Resultado Esperado:* Estado general cambia a `Firmado` / `Paz y Salvo`, habilitando la emisión oficial.

---

### Módulo 6: Gestión de Rechazos, Novedades y Devolución de Bienes (Casos 53 al 60)

* **TC-053: Registro de Rechazo por Bien Faltante en Almacén**
  * *Actor:* Lic. Martha Almacén.
  * *Pasos:* Seleccionar "Rechazar / Registrar Novedad" e ingresar: *"Falta entrega de taladro percutor serial T-500"*.
  * *Resultado Esperado:* Estado de la solicitud cambia a `Rechazado`.

* **TC-054: Despliegue de Banner Destacado con Motivo de Novedad**
  * *Actor:* Contratista visualizando su solicitud rechazada.
  * *Pasos:* Abrir el detalle de la solicitud.
  * *Resultado Esperado:* Se visualiza banner rojo con la observación de Almacén sobre el taladro faltante.

* **TC-055: Imposición de Marca de Agua de Rechazo en Vista del Certificado**
  * *Actor:* Cualquier usuario visualizando el formato en estado rechazado.
  * *Pasos:* Abrir la vista del formato GCCON-F-088.
  * *Resultado Esperado:* Marca de agua diagonal visible: `"SOLICITUD RECHAZADA - NO VÁLIDO"`.

* **TC-056: Retención Preventiva de la Firma del Contratista en Rechazo**
  * *Actor:* Sistema.
  * *Pasos:* Verificar vigencia del paz y salvo en estado rechazado.
  * *Resultado Esperado:* El paz y salvo no tiene validez legal mientras persista el rechazo.

* **TC-057: Subsanación de la Novedad y Aprobación del Área**
  * *Actor:* Lic. Martha Almacén.
  * *Pasos:* Una vez devuelto el elemento, firmar la casilla de Almacén.
  * *Resultado Esperado:* La casilla pasa a `Firmado`.

* **TC-058: Limpieza Automática de Residuos de Novedades tras Subsanación**
  * *Actor:* Sistema al completarse todas las firmas.
  * *Pasos:* Consultar la solicitud con todas las firmas completas.
  * *Resultado Esperado:* El banner de rechazo y la marca de agua desaparecen por completo.

* **TC-059: Historial de Auditoría de Rechazo Registrado en Base de Datos**
  * *Actor:* Sistema de auditoría (`auditoria_eventos`).
  * *Pasos:* Consultar historial de eventos.
  * *Resultado Esperado:* Registro que almacena fecha, usuario que rechazó, motivo y estado previo.

* **TC-060: Rechazo por Parte del Supervisor por Inconsistencias Contractuales**
  * *Actor:* Supervisor.
  * *Pasos:* Rechazar la solicitud en la etapa final con justificación técnica.
  * *Resultado Esperado:* La solicitud regresa a estado `Rechazado` para subsanación del contratista.

---

### Módulo 7: Administración de Usuarios, Dependencias y Certificación PDF (Casos 61 al 70)

* **TC-061: Creación Exitosa de Usuario con Contraseña Robusta**
  * *Actor:* Administrador General.
  * *Pasos:* Registrar usuario con clave `Sena2026*` (8+ caracteres, mayúscula, minúscula y número).
  * *Resultado Esperado:* HTTP 201, usuario guardado en MongoDB Atlas y reflejado en la tabla.

* **TC-062: Bloqueo de Creación de Usuario con Contraseña Débil**
  * *Actor:* Administrador General.
  * *Pasos:* Intentar registrar usuario con clave corta `abc12`.
  * *Resultado Esperado:* El formulario advierte los requisitos y bloquea el botón "Guardar".

* **TC-063: Bloqueo de Registro por Correo Institucional Duplicado**
  * *Actor:* Administrador General.
  * *Pasos:* Intentar crear usuario con correo `admin@gccon.com`.
  * *Resultado Esperado:* HTTP 400 *"El correo institucional o documento ya está registrado"*.

* **TC-064: Bloqueo de Registro por Documento de Identidad Duplicado**
  * *Actor:* Administrador General.
  * *Pasos:* Intentar crear usuario con cédula existente `1095000001`.
  * *Resultado Esperado:* Notificación: *"Ya existe un usuario registrado con ese documento"*.

* **TC-065: Desactivación de Dependencia con Confirmación Humanizada**
  * *Actor:* Administrador General.
  * *Pasos:* Desactivar la dependencia "Gestión de TIC".
  * *Resultado Esperado:* El diálogo de confirmación muestra el texto claro: *"¿Está seguro de desactivar la dependencia Gestión de TIC?"* sin códigos crudos.

* **TC-066: Expulsión en Tiempo Real de Usuario Deshabilitado (Flujo 7)**
  * *Actor:* Administrador deshabilitando a un usuario (`activo: false`).
  * *Pasos:* El usuario deshabilitado intenta realizar una acción con su token activo.
  * *Resultado Esperado:* El backend valida en base de datos y responde HTTP 401 *"Usuario deshabilitado"*.

* **TC-067: Edición de Datos de Contratista desde el Panel Administrativo**
  * *Actor:* Administrador General.
  * *Pasos:* Modificar el teléfono y nombre de un contratista y guardar.
  * *Resultado Esperado:* Actualización confirmada con notificación verde y persistencia en base de datos.

* **TC-068: Modal de Edición de Metadatos del Certificado GCCON-F-088**
  * *Actor:* Supervisor o Administrador.
  * *Pasos:* Abrir modal de metadatos y actualizar causal de terminación (ej. *"Terminación Normal"*).
  * *Resultado Esperado:* Los metadatos se reflejan en la vista previa del certificado.

* **TC-069: Fidelidad Gráfica y Estructural del Formato GCCON-F-088**
  * *Actor:* Cualquier usuario visualizando el paz y salvo emitido.
  * *Pasos:* Revisar la cabecera y estructura del documento en pantalla.
  * *Resultado Esperado:* Presenta el logotipo SENA, código GCCON-F-088, versión oficial 1, tabla de clasificación de información y cuadrícula de 14 filas.

* **TC-070: Generación y Descarga del Documento Oficial en PDF**
  * *Actor:* Contratista o Supervisor con solicitud aprobada.
  * *Pasos:* Hacer clic en "Descargar Paz y Salvo (PDF)".
  * *Resultado Esperado:* Descarga de archivo `.pdf` en formato Carta con alta resolución, 14 firmas estampadas y datos contractuales fidedignos.

---

## 5. Tabla de Mapeo Rápido para Ejecutores Automatizados de API

| Rango de Pruebas | Método | Endpoint Backend | Rol Requerido | Código HTTP Esperado |
|:---:|:---:|:---|:---:|:---:|
| `TC-001` - `TC-006` | `POST` | `/api/auth/login` | Público | `200 OK` / `401` / `403` |
| `TC-007` - `TC-008` | `POST` | `/api/auth/recuperar` | Público | `200 OK` |
| `TC-009` | `POST` | `/api/auth/restablecer` | Público | `400 Bad Request` |
| `TC-011` - `TC-020` | `GET` | `/api/usuarios` | `ADMINISTRADOR` | `200 OK` / `403 Forbidden` |
| `TC-021` - `TC-028` | `GET` | `/api/contratos` | Filtrado por rol | `200 OK` |
| `TC-029` - `TC-038` | `POST` | `/api/contratos` | `CONTRATISTA` | `201 Created` |
| `TC-039` - `TC-052` | `POST` | `/api/firmas` | `RESPONSABLE_AREA` | `200 OK` / `403 Forbidden` |
| `TC-053` - `TC-060` | `PATCH`| `/api/contratos/:id/estado` | `RESPONSABLE_AREA` / `SUPER` | `200 OK` |
| `TC-061` - `TC-064` | `POST` | `/api/usuarios` | `ADMINISTRADOR` | `201 Created` / `400 Bad Request` |
| `TC-065` - `TC-066` | `PATCH`| `/api/usuarios/estado/:id` | `ADMINISTRADOR` | `200 OK` |
| `TC-067` - `TC-070` | `GET` | `/api/contratos/:id/pdf` | Autenticado | `200 OK` (`application/pdf`) |

---

## 6. Criterios de Aceptación Global para TestSprite

1. **Total de Casos Formalizados:** Exactamente 70 casos de prueba independientes (`TC-001` a `TC-070`).
2. **Garantía de Meta:** Incluso si la IA consolida algunos escenarios, la suite generará y ejecutará ampliamente más de las 50 pruebas exigidas ($\approx 55\text{ a }65$ pruebas efectivas).
3. **Tasa de Aprobación Esperada:** $\ge 98\%$.
4. **Respuesta Máxima de API:** Menor a $500\text{ ms}$ en condiciones estándar de red.
