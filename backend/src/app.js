require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middlewares/errorHandler');
const { swaggerUi, swaggerDocument } = require('./config/swagger');

const Usuario = require('./models/Usuario');

const app = express();

// Middlewares de seguridad y utilidades
app.use(helmet());
app.use(morgan('dev'));

// CORS con lista blanca desde CORS_ORIGIN (separada por comas) o localhost en desarrollo
const origenesPermitidos = (process.env.CORS_ORIGIN || '').split(',').map(o => o.trim()).filter(Boolean);
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || origenesPermitidos.length === 0 || origenesPermitidos.includes(origin) || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Origen no permitido por CORS.'));
        }
    },
    credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Ruta de verificación / healthcheck
app.get('/api/health', (req, res) => {
    res.json({ mensaje: 'API Paz y Salvo Contractual SENA activa 🚀' });
});

// Ruta de prueba para verificar Compass
app.get('/api/test-db', async (req, res) => {
    try {
        const usuarios = await Usuario.find();
        res.json({
            mensaje: "¡Conexión verificada con éxito desde VS Code! 🎉",
            total_usuarios: usuarios.length,
            datos_desde_compass: usuarios
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rutas de Autenticación (Login)
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

// Rutas del Módulo de Usuarios
const usuarioRoutes = require('./routes/usuarioRoutes');
app.use('/api/usuarios', usuarioRoutes);
app.use('/usuarios', usuarioRoutes);

// Rutas del Módulo de Contratos e Inventario (Diagrama 2)
const contratoRoutes = require('./routes/contratoRoutes');
app.use('/api/contratos', contratoRoutes);
app.use('/contratos', contratoRoutes);

// Rutas del Módulo de Supervisión y Evaluación (Diagrama 3)
const supervisionRoutes = require('./routes/supervisionRoutes');
app.use('/api/contratos', supervisionRoutes);
app.use('/contratos', supervisionRoutes);

// Rutas del módulo de firmas (Diagrama 4)
const firmasRoutes = require('./routes/firmasRoutes');
app.use('/api/firmas', firmasRoutes);
app.use('/firmas', firmasRoutes);

// Rutas del Módulo de Dependencias y Responsables (RF-012)
const dependenciaRoutes = require('./routes/dependenciaRoutes');
app.use('/api/dependencias', dependenciaRoutes);
app.use('/dependencias', dependenciaRoutes);

// Rutas del Módulo de Formato GCCON-F-088 (Diagrama 6 / RF-004)
const formatoRoutes = require('./routes/formatoRoutes');
app.use('/api/formatos', formatoRoutes);
app.use('/formatos', formatoRoutes);

// Rutas del Módulo de Auditoría (RNF-003)
const auditoriaRoutes = require('./routes/auditoriaRoutes');
app.use('/api/auditoria', auditoriaRoutes);
app.use('/auditoria', auditoriaRoutes);

// Servir frontend compilado SPA si existe
const path = require('path');
const fs = require('fs');
const rutaFrontendDist = path.resolve(__dirname, '../../frontend/dist/spa');
if (fs.existsSync(rutaFrontendDist)) {
    app.use(express.static(rutaFrontendDist));
    app.use((req, res, next) => {
        if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/api-docs')) {
            return res.sendFile(path.join(rutaFrontendDist, 'index.html'));
        }
        next();
    });
}

// 404 para rutas de la API no encontradas
app.use((req, res) => {
    res.status(404).json({ mensaje: 'Ruta no encontrada.' });
});

// Manejador central de errores
app.use(errorHandler);

module.exports = app;
