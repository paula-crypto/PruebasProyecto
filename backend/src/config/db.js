const mongoose = require('mongoose');

const conectarDB = async (reintentos = 3) => {
    for (let i = 1; i <= reintentos; i++) {
        try {
            await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
            console.log('✅ Conexión exitosa a MongoDB:', mongoose.connection.name);
            return;
        } catch (error) {
            console.error(`⚠️ Intento ${i}/${reintentos} - Error al conectar a MongoDB:`, error.message);
            if (i === reintentos) {
                console.error('❌ No se pudo conectar a MongoDB tras varios intentos.');
                process.exit(1);
            }
            await new Promise(res => setTimeout(res, 2000));
        }
    }
};

module.exports = conectarDB;