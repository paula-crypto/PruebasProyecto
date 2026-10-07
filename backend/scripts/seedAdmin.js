require('dotenv').config();
const conectarDB = require('../src/config/db');
const Usuario = require('../src/models/Usuario');
const bcrypt = require('bcrypt');

async function crearAdministrador() {
  try {
    await conectarDB();

    const datos = {
      nombre_completo: process.env.SEED_ADMIN_NOMBRE || 'Administrador General',
      correo_institucional: process.env.SEED_ADMIN_EMAIL || 'admin@institucion.edu.co',
      password: process.env.SEED_ADMIN_PASSWORD || 'AdminSeguro123!',
      rol: 'Administrador'
    };

    const existente = await Usuario.findOne({ correo_institucional: datos.correo_institucional });
    if (existente) {
      console.log('El Administrador ya existe en la base de datos:', datos.correo_institucional);
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(datos.password, salt);

    const nuevo = new Usuario({
      nombre_completo: datos.nombre_completo,
      correo_institucional: datos.correo_institucional,
      password_hash,
      rol: datos.rol,
      activo: true
    });

    await nuevo.save();
    console.log('Administrador creado:', datos.correo_institucional);
    console.log('Contraseña temporal:', datos.password);
    process.exit(0);
  } catch (error) {
    console.error('Error creando administrador:', error.message);
    process.exit(1);
  }
}

crearAdministrador();
