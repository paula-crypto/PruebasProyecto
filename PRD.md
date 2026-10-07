# PRD: Sistema de Gestión de Paz y Salvo Contractual (SENA GCCON-F-088)
## Especificación de Requisitos de Producto y Matriz de Pruebas Automatizadas (TestSprite)

**Versión:** 2.0  
**Fecha:** Octubre 2026  
**Entorno de Pruebas:** Producción / Staging  
**Frontend URL:** `https://pruebasproyecto-frontend.vercel.app`  
**Backend API URL:** `https://api-paz-y-salvo.onrender.com/api`  
**Estándar Institucional:** Formato SENA GCCON-F-088  

---

## 1. Visión General del Producto y Objetivos

### 1.1 Propósito
El **Sistema de Paz y Salvo SENA GCCON-F-088** automatiza y digitaliza integralmente la liquidación contractual de contratistas de prestación de servicios en el SENA (Centro Agroturístico San Gil - Regional Santander). Reemplaza el proceso manual de recolección de firmas físicas en papel por un flujo digital con control de acceso basado en roles (RBAC), firma biométrica/manuscrita en canvas HTML5, trazabilidad forense y generación de certificados oficiales PDF idénticos al formato institucional.

### 1.2 Objetivos de Prueba en TestSprite
- **Validación RBAC Estricta:** Comprobar que ningún rol pueda ejecutar acciones ni ver información fuera de su alcance permitido.
- **Aislamiento de Contratistas:** Garantizar que un contratista únicamente pueda visualizar sus propias solicitudes y datos personales.
- **Integridad de Firmas en Cuadrícula GCCON-F-088:** Validar que los responsables de área únicamente puedan firmar en su casilla correspondiente (Filas 1 a 13) y el supervisor en la Fila 14.
- **Gestión de Rechazos y Novedades:** Verificar la imposición de la marca de agua de rechazo y la persistencia de observaciones por bienes pendientes.
- **Flujo Completo E2E:** Ejecutar el ciclo de vida completo: Radicación -> Firmas de Área -> Aprobación de Supervisor -> Descarga de Paz y Salvo PDF.

---

## 2. Catálogo de Roles, Credenciales y Datos de Prueba para TestSprite

A continuación se detalla la matriz completa de usuarios de prueba preconfigurados en el sistema para ejecución de pruebas unitarias, de integración y end-to-end:

### 2.1 Tabla Maestra de Credenciales y Roles

| # | Rol del Sistema | Nombre Completo | Correo de Acceso | Contraseña | Cargo / Dependencia | Documento / Cédula | No. Contrato Asignado |
|---|-----------------|-----------------|------------------|------------|---------------------|--------------------|-----------------------|
| **1** | `ADMINISTRADOR` | Administrador General | `admin@gccon.com` | `admin` *(o `Admin1234!`)* | Administrador del Sistema | `1095000001` | N/A |
| **2** | `ADMINISTRADOR` | Paula Administradora | `paula.admin@gccon.com` | `123` | Coordinadora Aseguramiento | `1095000002` | N/A |
| **3** | `SUPERVISOR` | Ing. Carlos Supervisor | `supervisor@gccon.com` | `super` | Supervisor de Contratos TIC | `1095000003` | N/A |
| **4** | `SUPERVISOR` | Dra. Ana María Gómez | `agomez@sena.edu.co` | `123` | Supervisora Senior | `1095000004` | N/A |
| **5** | `SUPERVISOR` | Ing. Fernando Ramírez | `f.ramirez@sena.edu.co` | `123` | Supervisor Infraestructura | `1095000005` | N/A |
| **6** | `CONTRATISTA` | Carlos Eduardo Mendoza | `carlos.mendoza@email.com` | `123` | Consultor en Redes | `1097890123` | `CNT-2026-042` |
| **7** | `CONTRATISTA` | Laura Andrea Contratista | `contratista@gccon.com` | `123` | Especialista Soporte | `1095432189` | `CNT-2026-014` |
| **8** | `CONTRATISTA` | Juan Carlos Pérez | `juan.perez@correo.com` | `123` | Desarrollador Full-Stack | `1098765432` | `CNT-2025-088` |
| **9** | `CONTRATISTA` | María Fernanda Gómez | `maria.gomez@correo.com` | `123` | Instructora Telemática | `1094321765` | `CNT-2026-029` |
| **10** | `CONTRATISTA` | Diego Morales Castro | `diego.morales@correo.com` | `123` | Técnico Mantenimiento | `1096543210` | `CNT-2026-055` |
| **11** | `RESPONSABLE_AREA` | Franklin Rolando Chacón | `franklin.chacon@sena.edu.co` | `123` | **Fila 1:** Gestión de TIC | `1095111001` | N/A |
| **12** | `RESPONSABLE_AREA` | Hilda Lucía Ramírez | `hilda.ramirez@sena.edu.co` | `123` | **Fila 2:** Admin. Documentos | `1095111002` | N/A |
| **13** | `RESPONSABLE_AREA` | Johon Fredy Sanabria | `johon.sanabria@sena.edu.co` | `123` | **Fila 3:** Coordinación Académica | `1095111003` | N/A |
| **14** | `RESPONSABLE_AREA` | Lic. Martha Almacén | `martha.almacen@sena.edu.co` | `123` | **Fila 4:** Almacén e Inventarios | `1095111004` | N/A |
| **15** | `RESPONSABLE_AREA` | Juan David Silva | `juan.silva@sena.edu.co` | `123` | **Fila 5:** Servicios Generales | `1095111005` | N/A |
| **16** | `RESPONSABLE_AREA` | Zaida Leny Melgarejo | `zaida.melgarejo@sena.edu.co` | `123` | **Fila 6:** Contabilidad | `1095111006` | N/A |
| **17** | `RESPONSABLE_AREA` | Nelcy Mabel Mayorga | `nelcy.mayorga@sena.edu.co` | `123` | **Fila 7:** Tesorería | `1095111007` | N/A |
| **18** | `RESPONSABLE_AREA` | Andrea Juliana Celis | `andrea.celis@sena.edu.co` | `123` | **Fila 8:** Biblioteca | `1095111008` | N/A |
| **19** | `RESPONSABLE_AREA` | Zaida Jeleidy García | `zaida.garcia@sena.edu.co` | `123` | **Fila 9:** Líder SIGA | `1095111009` | N/A |
| **20** | `RESPONSABLE_AREA` | Erika Johana Gómez | `erika.gomez@sena.edu.co` | `123` | **Fila 10:** Admin. Educativa | `1095111010` | N/A |
| **21** | `RESPONSABLE_AREA` | Nelson Fabián Duarte | `nelson.duarte@sena.edu.co` | `123` | **Fila 11:** Seguimiento Administrativo | `1095111011` | N/A |
| **22** | `RESPONSABLE_AREA` | Karen Andrea García | `karen.garcia@sena.edu.co` | `123` | **Fila 12:** Apoyo Etapa Productiva | `1095111012` | N/A |
| **23** | `RESPONSABLE_AREA` | Eileen Erlensi Hurtado | `eileen.hurtado@sena.edu.co` | `123` | **Fila 13:** Apoyo Novedades | `1095111013` | N/A |

---

## 3. Matriz de Cuadrícula Oficial GCCON-F-088 (Mapeo de Filas y Dependencias)

Para evaluar las validaciones de firma de TestSprite, la tabla institucional GCCON-F-088 se estructura en **14 filas obligatorias**:

```
+----+---------------------------------------------------------------+----------------------------------+
| F# | Área / Dependencia Evaluadora                                 | Funcionario Responsable          |
+----+---------------------------------------------------------------+----------------------------------+
| 01 | Gestión de TIC                                                | Franklin Rolando Chacón López    |
| 02 | Administración de Documentos                                  | Hilda Lucía Ramírez Alvarado     |
| 03 | Coordinación de Área / Grupo / Académica                      | Johon Fredy Sanabria Muñoz       |
| 04 | Almacén e Inventarios                                         | Lic. Martha Almacén              |
| 05 | Servicios Generales y Adquisiciones                           | Juan David Silva Gutiérrez       |
| 06 | Contabilidad                                                  | Zaida Leny Melgarejo Ballesteros |
| 07 | Tesorería                                                     | Nelcy Mabel Mayorga Pinto        |
| 08 | Biblioteca                                                    | Andrea Juliana Celis Camacho     |
| 09 | Líder SIGA                                                    | Zaida Jeleidy García Jaimes      |
| 10 | Administración Educativa                                      | Erika Johana Gómez Verdugo       |
| 11 | Apoyo al Seguimiento de Procesos Administrativos              | Nelson Fabián Duarte Peñaloza    |
| 12 | Apoyo Etapa Productiva                                        | Karen Andrea García Carreño      |
| 13 | Apoyo al Seguimiento a Procesos Administrativos y Novedades   | Eileen Erlensi Hurtado Ariza     |
| 14 | Supervisor de Contrato (Liquidación Final)                   | Ing. Carlos Supervisor           |
+----+---------------------------------------------------------------+----------------------------------+
```

---

## 4. Casos de Prueba E2E para TestSprite (Test Scenarios)

### Escenario 1: Autenticación, Control de Roles y Aislamiento de Datos
- **ID:** `TC-AUTH-001`
- **Rol evaluado:** `CONTRATISTA` (`carlos.mendoza@email.com` / `123`).
- **Pasos:**
  1. Navegar a `#/login`.
  2. Ingresar credenciales de contratista.
  3. Verificar redirección automática a la vista `#/app/solicitudes`.
  4. Comprobar que en la tabla de solicitudes **únicamente** se muestran contratos pertenecientes a Carlos Eduardo Mendoza (Cédula `1097890123`).
  5. Intentar navegar directamente a `#/app/usuarios` o `#/app/supervisores`.
- **Resultado Esperado:**
  - El sistema bloquea el acceso a rutas no autorizadas (redirección o mensaje "No autorizado").
  - Ningún registro de otros contratistas es visible en la UI ni en los payloads JSON de red.

---

### Escenario 2: Radicación de Solicitud de Paz y Salvo con Cédula y Vigencia Anual
- **ID:** `TC-SOL-002`
- **Rol evaluado:** `CONTRATISTA` (`contratista@gccon.com` / `123`).
- **Datos de Entrada:**
  - Contrato: `CNT-2026-014`
  - Cédula / Identificación: `1095432189`
  - Dependencia: `Gestión de TIC`
  - Supervisor Asignado: `Ing. Carlos Supervisor`
  - Objeto Contractual: `Prestación de servicios profesionales de apoyo técnico.`
- **Pasos:**
  1. Abrir modal o página de "Nueva Solicitud".
  2. Verificar que el campo **Identificación / Documento** se autocompleta correctamente con `1095432189` y no se muestra vacío ni con `—`.
  3. Diligenciar formulario y adjuntar archivo PDF de informe final.
  4. Realizar trazo manuscrito en el componente Canvas de firma del contratista.
  5. Presionar botón "Radicar Solicitud".
- **Resultado Esperado:**
  - Notificación positiva: "Solicitud radicada exitosamente".
  - La solicitud queda en estado `En revisión` y se inicializan las 14 casillas de trazabilidad de firmas.

---

### Escenario 3: Validación Estricta de Firma por Responsable de Área
- **ID:** `TC-SIGN-003`
- **Rol evaluado:** `RESPONSABLE_AREA` (`franklin.chacon@sena.edu.co` / `123` - Fila 1 TIC).
- **Pasos:**
  1. Iniciar sesión como Franklin Chacón.
  2. Ingresar al detalle de la solicitud radicada en `TC-SOL-002`.
  3. Intentar firmar en la **Fila 4 (Almacén)** o **Fila 6 (Contabilidad)**.
  4. Firmar en la **Fila 1 (Gestión de TIC)** utilizando el canvas.
  5. Confirmar firma.
- **Resultado Esperado:**
  - En las casillas de otras dependencias, el botón de firma está deshabilitado o emite una alerta indicando que no corresponde a su área.
  - En la Fila 1, el trazo se guarda con éxito, registrando fecha, hora y nombre del funcionario.

---

### Escenario 4: Flujo de Rechazo y Novedades por Bienes Pendientes
- **ID:** `TC-REJ-004`
- **Rol evaluado:** `RESPONSABLE_AREA` (`martha.almacen@sena.edu.co` / `123` - Almacén).
- **Pasos:**
  1. Iniciar sesión como Martha Almacén.
  2. Abrir la solicitud del contratista.
  3. Presionar botón "Rechazar / Registrar Novedad".
  4. Ingresar motivo: *"Pendiente entrega de laptop corporativa Lenovo serial LNV-9821"*.
  5. Confirmar acción.
  6. Iniciar sesión con el contratista (`contratista@gccon.com`).
- **Resultado Esperado:**
  - Estado de la solicitud cambia a `Rechazado`.
  - En la visualización del formato GCCON-F-088 aparece la marca de agua: `"SOLICITUD RECHAZADA - NO VÁLIDO"`.
  - Se despliega el banner de novedades con el texto ingresado por Almacén.
  - La firma del contratista queda en retención preventiva.

---

### Escenario 5: Aprobación Final de Supervisor y Generación de Certificado PDF
- **ID:** `TC-PDF-005`
- **Rol evaluado:** `SUPERVISOR` (`supervisor@gccon.com` / `super`).
- **Precondición:** Todas las dependencias (Filas 1 a 13) se encuentran firmadas y conformes.
- **Pasos:**
  1. Iniciar sesión como Supervisor.
  2. Abrir la solicitud completa.
  3. Estampar la firma de supervisión en la **Fila 14 (Supervisor de Contrato)**.
  4. Presionar botón "Aprobar y Emitir Paz y Salvo".
  5. Presionar botón "Descargar Certificado GCCON-F-088 (PDF)".
- **Resultado Esperado:**
  - La solicitud transiciona a estado `Firmado` / `Paz y Salvo`.
  - El documento PDF generado cumple fielmente con la estructura oficial SENA: cabecera institucional, cuadrícula de 14 filas con firmas e información de documento y contrato.

---

### Escenario 6: Creación y Gestión de Usuarios (Políticas de Seguridad)
- **ID:** `TC-ADMIN-006`
- **Rol evaluado:** `ADMINISTRADOR` (`admin@gccon.com` / `admin`).
- **Pasos:**
  1. Ingresar a `#/app/usuarios` y hacer clic en "Nuevo Usuario".
  2. Intentar guardar con contraseña débil (ej. `1234` o `solo_minusculas`).
  3. Comprobar que el formulario bloquea el envío requiriendo: mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número.
  4. Ingresar datos válidos con contraseña compleja (ej. `Sena2026*`).
  5. Presionar "Guardar".
- **Resultado Esperado:**
  - El sistema valida las políticas en frontend y backend.
  - Respuesta `201 Created` y el nuevo usuario se refleja inmediatamente en la lista persistido en MongoDB Atlas.

---

## 5. Especificación de Endpoints del Backend para Pruebas API

| Método | Endpoint | Roles Permitidos | Payload Clave | Código de Respuesta Esperado |
|:---|:---|:---|:---|:---:|
| `POST` | `/api/auth/login` | Todos | `{ correo_institucional, password }` | `200 OK` (retorna JWT) |
| `GET` | `/api/health` | Público | Ninguno | `200 OK` (`API activa`) |
| `GET` | `/api/usuarios` | `ADMINISTRADOR`, `SUPERVISOR` | Header `Authorization: Bearer <token>` | `200 OK` |
| `POST` | `/api/usuarios` | `ADMINISTRADOR`, `SUPERVISOR` | `{ nombre_completo, correo_institucional, documento, rol, password }` | `201 Created` |
| `GET` | `/api/contratos` | Todos (filtrado por rol) | Header `Authorization: Bearer <token>` | `200 OK` |
| `POST` | `/api/contratos` | `CONTRATISTA`, `ADMINISTRADOR` | `{ numero_contrato, documento_contratista, dependencia_id, supervisor_id }` | `201 Created` |
| `POST` | `/api/firmas` | `RESPONSABLE_AREA`, `SUPERVISOR`, `CONTRATISTA` | `{ contrato_id, fila_formato_id, firma_base64 }` | `200 OK` |
| `PATCH` | `/api/contratos/:id/estado` | `SUPERVISOR`, `ADMINISTRADOR` | `{ estado: "Aprobado" | "Rechazado", motivo }` | `200 OK` |

---

## 6. Criterios de Aceptación Global para TestSprite

1. **Tasa de Éxito (Pass Rate):** $\ge 98\%$ en la suite de pruebas automatizadas.
2. **Cero Fugas de Seguridad:** Ningún endpoint protegido debe responder `200` ante peticiones sin token o con roles no autorizados.
3. **Persistencia Verificada:** Todas las operaciones de creación y actualización deben reflejarse de inmediato en la base de datos de MongoDB Atlas.
4. **Respuesta Rápida:** Tiempo medio de respuesta de API menor a $500\text{ ms}$ en condiciones normales de red.
