require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Usuario = require('../src/models/Usuario');
const Dependencia = require('../src/models/DependenciaArea');

async function seedAll() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB conectado.');

    const salt = await bcrypt.genSalt(10);

    // 1. Dependencias
    const areas = [
      'Gestión Tecnológica',
      'Recursos Humanos',
      'Infraestructura y Servicios Generales',
      'Almacén e Inventarios'
    ];
    for (const nom of areas) {
      const existe = await Dependencia.findOne({ nombre_dependencia: nom });
      if (!existe) {
        await Dependencia.create({ nombre_dependencia: nom, activo: true });
      }
    }

    // 2. Administrador
    let admin = await Usuario.findOne({ correo_institucional: 'admin@gccon.com' });
    if (!admin) {
      admin = await Usuario.create({
        nombre_completo: 'Administrador General',
        correo_institucional: 'admin@gccon.com',
        password_hash: await bcrypt.hash('Admin1234!', salt),
        rol: 'Administrador',
        cargo: 'Administrador del Sistema',
        activo: true
      });
      console.log('Admin creado: admin@gccon.com');
    }

    // 3. Supervisor
    let superv = await Usuario.findOne({ correo_institucional: 'supervisor@gccon.com' });
    if (!superv) {
      superv = await Usuario.create({
        nombre_completo: 'Ing. Carlos Supervisor',
        correo_institucional: 'supervisor@gccon.com',
        password_hash: await bcrypt.hash('Super1234!', salt),
        rol: 'Supervisor',
        cargo: 'Supervisor de Contratos',
        telefono: '3101234567',
        activo: true
      });
      console.log('Supervisor creado: supervisor@gccon.com');
    }

    // 4. Contratista
    let contra = await Usuario.findOne({ correo_institucional: 'contratista@gccon.com' });
    if (!contra) {
      contra = await Usuario.create({
        nombre_completo: 'Laura Andrea Contratista',
        correo_institucional: 'contratista@gccon.com',
        password_hash: await bcrypt.hash('Contra1234!', salt),
        rol: 'Contratista',
        cargo: 'Contratista de Apoyo',
        supervisor_id: superv ? superv._id : null,
        telefono: '3157654321',
        activo: true
      });
      console.log('Contratista creado: contratista@gccon.com');
    }

    // 5. Responsables de Área
    const depAlmacen = await Dependencia.findOne({ nombre_dependencia: /Almacén/i });
    let areaAlmacen = await Usuario.findOne({ correo_institucional: 'area.almacen@gccon.com' });
    if (!areaAlmacen) {
      areaAlmacen = await Usuario.create({
        nombre_completo: 'Lic. Martha Almacén',
        correo_institucional: 'area.almacen@gccon.com',
        password_hash: await bcrypt.hash('Area1234!', salt),
        rol: 'ResponsableArea',
        cargo: 'Líder de Almacén e Inventarios',
        dependencia_id: depAlmacen ? depAlmacen._id : null,
        activo: true
      });
      if (depAlmacen) {
        depAlmacen.responsable_id = areaAlmacen._id;
        await depAlmacen.save();
      }
      console.log('Responsable Almacén creado: area.almacen@gccon.com');
    }

    const depTic = await Dependencia.findOne({ nombre_dependencia: /Tecnológica/i });
    let areaTic = await Usuario.findOne({ correo_institucional: 'area.tic@gccon.com' });
    if (!areaTic) {
      areaTic = await Usuario.create({
        nombre_completo: 'Ing. Roberto TIC',
        correo_institucional: 'area.tic@gccon.com',
        password_hash: await bcrypt.hash('Area1234!', salt),
        rol: 'ResponsableArea',
        cargo: 'Líder de Gestión Tecnológica',
        dependencia_id: depTic ? depTic._id : null,
        activo: true
      });
      if (depTic) {
        depTic.responsable_id = areaTic._id;
        await depTic.save();
      }
      console.log('Responsable TIC creado: area.tic@gccon.com');
    }

    console.log('Semillero ejecutado exitosamente.');
    process.exit(0);
  } catch (err) {
    console.error('Error en semillero:', err);
    process.exit(1);
  }
}

seedAll();
