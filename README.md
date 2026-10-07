# Sistema de Paz y Salvo Contractual SENA (GCCON-F-088)

Proyecto integral unificado (Frontend + Backend) para la gestión digital del formato GCCON-F-088 de Paz y Salvo Contractual del SENA.

---

## 📁 Estructura del Proyecto Unificado

```text
backen_paz_y_salvo-main/
├── backend/                  # Servidor Node.js, Express, MongoDB (Mongoose), JWT, PDFKit
│   ├── src/
│   │   ├── controllers/      # Controladores (Auth, Usuarios, Contratos, Firmas, Dependencias)
│   │   ├── models/           # Modelos Mongoose (Usuario, Contrato, BienEntregado, Dependencia, TrazabilidadFirma)
│   │   ├── routes/           # Rutas API REST
│   │   ├── services/         # Generador de PDF oficial SENA GCCON-F-088
│   │   └── seeders/          # Semillero inicial de BD
│   ├── .env                  # Variables de entorno del backend (PORT=3000, MONGODB_URI)
│   └── package.json
│
├── frontend/                 # Aplicación Web Vue 3, Quasar Framework, Pinia, Vite
│   ├── src/
│   │   ├── pages/            # Vistas (Login, Solicitudes, NuevaSolicitud, Firmas, Supervisores, Contratistas, Dependencias)
│   │   ├── stores/           # Pinia Stores (authStore conectado al backend)
│   │   ├── services/         # Cliente Axios unificado con interceptor de token JWT
│   │   └── router/           # Enrutador con guardias de navegación por rol
│   ├── .env                  # Variables de entorno del frontend (VITE_API_URL)
│   └── package.json
│
├── iniciar_proyecto.bat      # Script de inicio rápido en Windows (doble clic)
├── package.json              # Gestor de scripts unificado
└── README.md
```

---

## 🚀 Inicio Rápido

### Opción 1: Un solo clic (Windows)
Haz doble clic en el archivo **`iniciar_proyecto.bat`**.  
Este script levantará automáticamente el backend (puerto 3000), el frontend (puerto 9000) y abrirá tu navegador.

### Opción 2: Desde la terminal
```bash
# Iniciar backend
cd backend
npm run dev

# En otra terminal, iniciar frontend
cd frontend
npm run dev
```

---

## 🔐 Credenciales de Acceso por Defecto

- **Rol Administrador:**
  - **Correo:** `admin@gccon.com`
  - **Contraseña:** `Admin1234!`

---

## 📋 Flujo de Negocio Completo

1. **Administrador:**
   - Inicia sesión con `admin@gccon.com`.
   - Crea los usuarios **Supervisores** y las **Dependencias/Áreas** (Gestión Tecnológica, Almacén, Recursos Humanos, etc.).
2. **Supervisor:**
   - Inicia sesión.
   - Crea los usuarios **Contratistas** asignados bajo su supervisión.
3. **Contratista:**
   - Inicia sesión.
   - Diligencia una **Nueva Solicitud de Paz y Salvo (GCCON-F-088)**:
     - Ingresa datos del contrato (objeto, fecha inicio, fecha fin).
     - Agrega la lista de **Bienes Entregados** (descripción, código de inventario, cantidad, estado).
     - Selecciona las áreas requeridas para paz y salvo.
4. **Supervisor:**
   - Evalúa la solicitud del contratista (Aprobar / Rechazar).
   - Al aprobarla, el estado pasa a `firmas_pendientes`.
5. **Firmas de Áreas:**
   - Cada responsable de área entra a la sección **Firmas**.
   - Aprueba o rechaza el paz y salvo de su área.
6. **Finalización y Descarga:**
   - Cuando todas las áreas firman, el contrato cambia automáticamente a estado **`finalizado`**.
   - Se puede descargar el documento oficial **PDF GCCON-F-088** con sus marcas de verificación criptográficas.

---

## 🔒 Seguridad de Firmas

Por estricto requerimiento de seguridad, **las imágenes o trazos Base64 de las firmas NO se almacenan en la base de datos**.  
En su lugar, el sistema genera y almacena un hash criptográfico **SHA-256** junto con la fecha y hora de la firma, garantizando integridad, no repudio y protección de datos.
