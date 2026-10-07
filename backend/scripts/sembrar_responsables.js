const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuariosPlantilla = [
  {
    nombre_completo: 'Franklin Rolando Chacon Lopez',
    correo_institucional: 'franklin.chacon@sena.edu.co',
    cargo: 'Responsable de Gestión de TIC',
    dependencia: 'Gestión de TIC',
    rol: 'ResponsableArea',
    documento: '91001001',
    telefono: '3101110001'
  },
  {
    nombre_completo: 'Hilda Lucia Ramirez Alvarado',
    correo_institucional: 'hilda.ramirez@sena.edu.co',
    cargo: 'Responsable de Administración de Documentos',
    dependencia: 'Administración de Documentos',
    rol: 'ResponsableArea',
    documento: '91001002',
    telefono: '3101110002'
  },
  {
    nombre_completo: 'Johon Fredy Sanabria Muñoz',
    correo_institucional: 'johon.sanabria@sena.edu.co',
    cargo: 'Coordinador Académico / Supervisor',
    dependencia: 'Secretaría General / Coordinación',
    rol: 'ResponsableArea',
    documento: '91001003',
    telefono: '3101110003'
  },
  {
    nombre_completo: 'Lic. Martha Almacén',
    correo_institucional: 'martha.almacen@sena.edu.co',
    cargo: 'Responsable de Almacén e Inventarios',
    dependencia: 'Almacén e Inventarios',
    rol: 'ResponsableArea',
    documento: '91001004',
    telefono: '3101110004'
  },
  {
    nombre_completo: 'Juan David Silva Guierrez',
    correo_institucional: 'juan.silva@sena.edu.co',
    cargo: 'Responsable de Servicios Generales y Adquisiciones',
    dependencia: 'Servicios Generales, Adquisiciones',
    rol: 'ResponsableArea',
    documento: '91001005',
    telefono: '3101110005'
  },
  {
    nombre_completo: 'Zaida Leny Melgarejo Ballesteros',
    correo_institucional: 'zaida.melgarejo@sena.edu.co',
    cargo: 'Responsable de Contabilidad',
    dependencia: 'Contabilidad',
    rol: 'ResponsableArea',
    documento: '91001006',
    telefono: '3101110006'
  },
  {
    nombre_completo: 'Nelcy Mabel Mayorga Pinto',
    correo_institucional: 'nelcy.mayorga@sena.edu.co',
    cargo: 'Responsable de Tesorería',
    dependencia: 'Tesorería',
    rol: 'ResponsableArea',
    documento: '91001007',
    telefono: '3101110007'
  },
  {
    nombre_completo: 'Andrea Juliana Celis Camacho',
    correo_institucional: 'andrea.celis@sena.edu.co',
    cargo: 'Responsable de Biblioteca',
    dependencia: 'Biblioteca',
    rol: 'ResponsableArea',
    documento: '91001008',
    telefono: '3101110008'
  },
  {
    nombre_completo: 'Zaida Jeleidy Garcia Jaimes',
    correo_institucional: 'zaida.garcia@sena.edu.co',
    cargo: 'Líder SIGA',
    dependencia: 'Otro (Líder SIGA)',
    rol: 'ResponsableArea',
    documento: '91001009',
    telefono: '3101110009'
  },
  {
    nombre_completo: 'Erika Johana Gómez Verdugo',
    correo_institucional: 'erika.gomez@sena.edu.co',
    cargo: 'Responsable de Administración Educativa',
    dependencia: 'Otro (Administración Educativa)',
    rol: 'ResponsableArea',
    documento: '91001010',
    telefono: '3101110010'
  },
  {
    nombre_completo: 'Nelson Fabian Duarte Peñaloza',
    correo_institucional: 'nelson.duarte@sena.edu.co',
    cargo: 'Responsable de Apoyo al Seguimiento de Procesos',
    dependencia: 'Apoyo al Seguimiento de los Procesos Administrativos y Novedades',
    rol: 'ResponsableArea',
    documento: '91001011',
    telefono: '3101110011'
  },
  {
    nombre_completo: 'Karen Andrea Garcia Carreño',
    correo_institucional: 'karen.garcia@sena.edu.co',
    cargo: 'Responsable de Apoyo Etapa Productiva',
    dependencia: 'Apoyo Etapa Productiva',
    rol: 'ResponsableArea',
    documento: '91001012',
    telefono: '3101110012'
  },
  {
    nombre_completo: 'Yudith Milagros Martinez Bautista',
    correo_institucional: 'yudith.martinez@sena.edu.co',
    cargo: 'Responsable de Biblioteca',
    dependencia: 'Biblioteca',
    rol: 'ResponsableArea',
    documento: '91001013',
    telefono: '3101110013'
  },
  {
    nombre_completo: 'Eileen Erlensi Hurtado Ariza',
    correo_institucional: 'eileen.hurtado@sena.edu.co',
    cargo: 'Responsable de Apoyo al Seguimiento de Procesos',
    dependencia: 'Apoyo al Seguimiento de los Procesos Administrativos y Novedades',
    rol: 'ResponsableArea',
    documento: '91001014',
    telefono: '3101110014'
  }
];

async function sembrar() {
  const uri = process.env.MONGODB_URI || 'mongodb+srv://paz_y_salvo:ORIenbephYWtdv84@cluster0.cenmibs.mongodb.net/pazysalvo_sena';
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const col = db.collection('usuarios');

  const passwordHash = await bcrypt.hash('123', 10);

  for (const u of usuariosPlantilla) {
    const existe = await col.findOne({ correo_institucional: u.correo_institucional.toLowerCase() });
    if (!existe) {
      await col.insertOne({
        nombre_completo: u.nombre_completo,
        correo_institucional: u.correo_institucional.toLowerCase(),
        documento: u.documento,
        password_hash: passwordHash,
        rol: u.rol,
        telefono: u.telefono,
        cargo: u.cargo,
        dependencia: u.dependencia,
        activo: true,
        intentos_login: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Creado: ' + u.nombre_completo + ' (' + u.correo_institucional + ')');
    } else {
      await col.updateOne(
        { _id: existe._id },
        { 
          $set: { 
            nombre_completo: u.nombre_completo,
            cargo: u.cargo,
            dependencia: u.dependencia,
            password_hash: passwordHash,
            activo: true
          } 
        }
      );
      console.log('Actualizado: ' + u.nombre_completo + ' (' + u.correo_institucional + ')');
    }
  }

  console.log('Sembrado finalizado exitosamente.');
  await mongoose.disconnect();
}

sembrar().catch(err => {
  console.error('Error al sembrar:', err);
  process.exit(1);
});
