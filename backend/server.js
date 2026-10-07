require('dotenv').config();
const app = require('./src/app');
const conectarDB = require('./src/config/db');

async function iniciar() {
    try {
        await conectarDB();
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Error al inicializar el servidor:', err);
        process.exit(1);
    }
}

iniciar();
