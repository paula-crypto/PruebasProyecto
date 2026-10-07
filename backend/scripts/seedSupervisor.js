require('dotenv').config();
const conectarDB = require('../src/config/db');
const Usuario = require('../src/models/Usuario');
const bcrypt = require('bcrypt');

async function crearSupervisor() {
  try {
    await conectarDB();

    const datos = {
      nombre_completo: 'Supervisor Prueba',
      correo_institucional: process.env.SEED_SUPERVISOR_EMAIL || 'supervisor.prueba@institucion.edu',
      password: process.env.SEED_SUPERVISOR_PASSWORD || 'ClaveSegura123!',
      rol: 'Supervisor',
      telefono: '3001112222'
    };

    const existente = await Usuario.findOne({ correo_institucional: datos.correo_institucional });
    if (existente) {
      console.log('El Supervisor ya existe en la base de datos:', datos.correo_institucional);
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(datos.password, salt);

    const nuevo = new Usuario({
      nombre_completo: datos.nombre_completo,
      correo_institucional: datos.correo_institucional,
      password_hash,
      rol: datos.rol,
      telefono: datos.telefono,
      activo: true
    });

    await nuevo.save();
    console.log('Supervisor creado:', datos.correo_institucional);
    console.log('Contraseña temporal:', datos.password);
    process.exit(0);
  } catch (error) {
    console.error('Error creando supervisor:', error.message);
    process.exit(1);
  }
}

crearSupervisor();
