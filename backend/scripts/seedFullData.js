require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const Usuario = require('../src/models/Usuario');
const Dependencia = require('../src/models/DependenciaArea');
const Contrato = require('../src/models/Contrato');
const BienEntregado = require('../src/models/BienEntregado');
const TrazabilidadFirma = require('../src/models/TrazabilidadFirma');

async function seedFullData() {
  try {
    console.log('Conectando a MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conexión exitosa.');

    const salt = await bcrypt.genSalt(10);
    const passComun = await bcrypt.hash('12345678', salt);
    const passAdmin = await bcrypt.hash('Admin1234!', salt);

    // 1. Dependencias SENA
    console.log('Creando dependencias...');
    const dependenciasData = [
      { nombre: 'Gestión Tecnológica (TIC)', desc: 'Equipos de cómputo, accesos y software' },
      { nombre: 'Almacén e Inventarios', desc: 'Control de bienes devolutivos y herramientas' },
      { nombre: 'Recursos Humanos / Talento Humano', desc: 'Carné institucional y paz y salvo laboral' },
      { nombre: 'Infraestructura y Servicios Generales', desc: 'Llaves, tarjetas de acceso y puestos físicos' },
      { nombre: 'Biblioteca y Archivo', desc: 'Material bibliográfico y expedientes documentales' },
      { nombre: 'Bienestar al Aprendiz y Comunidad', desc: 'Paz y salvo de actividades y préstamos' }
    ];

    const dependenciasDocs = {};
    for (const d of dependenciasData) {
      let dep = await Dependencia.findOne({ nombre_dependencia: d.nombre });
      if (!dep) {
        dep = await Dependencia.create({
          nombre_dependencia: d.nombre,
          descripcion: d.desc,
          activo: true
        });
      }
      dependenciasDocs[d.nombre] = dep;
    }

    // 2. Administradores
    console.log('Creando administradores...');
    const admins = [
      {
        nombre_completo: 'Administrador General SENA',
        correo_institucional: 'admin@gccon.com',
        password_hash: passAdmin,
        rol: 'Administrador',
        cargo: 'Administrador del Sistema Paz y Salvo',
        telefono: '3101112233'
      },
      {
        nombre_completo: 'Paula Administradora',
        correo_institucional: 'paula.admin@gccon.com',
        password_hash: passAdmin,
        rol: 'Administrador',
        cargo: 'Coordinadora de Aseguramiento Contractual',
        telefono: '3124445566'
      }
    ];
    for (const u of admins) {
      const existe = await Usuario.findOne({ correo_institucional: u.correo_institucional });
      if (!existe) await Usuario.create({ ...u, activo: true });
    }

    // 3. Supervisores
    console.log('Creando supervisores...');
    const supervisoresData = [
      {
        nombre_completo: 'Ing. Carlos Supervisor',
        correo_institucional: 'supervisor@gccon.com',
        password_hash: passComun,
        rol: 'Supervisor',
        cargo: 'Supervisor de Contratos de Servicios TIC',
        telefono: '3101234567'
      },
      {
        nombre_completo: 'Dra. Ana María Gómez',
        correo_institucional: 'agomez@sena.edu.co',
        password_hash: passComun,
        rol: 'Supervisor',
        cargo: 'Supervisora Senior de Contratación',
        telefono: '3187654321'
      },
      {
        nombre_completo: 'Ing. Fernando Ramírez',
        correo_institucional: 'f.ramirez@sena.edu.co',
        password_hash: passComun,
        rol: 'Supervisor',
        cargo: 'Supervisor de Infraestructura y Obras',
        telefono: '3209876543'
      }
    ];
    const supervisoresDocs = [];
    for (const s of supervisoresData) {
      let sup = await Usuario.findOne({ correo_institucional: s.correo_institucional });
      if (!sup) {
        sup = await Usuario.create({ ...s, activo: true });
      }
      supervisoresDocs.push(sup);
    }

    // 4. Responsables de Área
    console.log('Creando responsables de área...');
    const responsablesData = [
      {
        nombre: 'Lic. Martha Almacén',
        correo: 'area.almacen@gccon.com',
        dep: 'Almacén e Inventarios',
        cargo: 'Líder de Almacén e Inventarios'
      },
      {
        nombre: 'Ing. Roberto TIC',
        correo: 'area.tic@gccon.com',
        dep: 'Gestión Tecnológica (TIC)',
        cargo: 'Líder de Infraestructura TIC'
      },
      {
        nombre: 'Dra. Claudia Ramos',
        correo: 'rrhh@sena.edu.co',
        dep: 'Recursos Humanos / Talento Humano',
        cargo: 'Líder de Gestión de Talento Humano'
      },
      {
        nombre: 'Lic. Jorge Biblioteca',
        correo: 'biblioteca@sena.edu.co',
        dep: 'Biblioteca y Archivo',
        cargo: 'Responsable de Archivo y Centro de Información'
      }
    ];

    const responsablesDocs = {};
    for (const r of responsablesData) {
      let resp = await Usuario.findOne({ correo_institucional: r.correo });
      const depDoc = dependenciasDocs[r.dep];
      if (!resp) {
        resp = await Usuario.create({
          nombre_completo: r.nombre,
          correo_institucional: r.correo,
          password_hash: passComun,
          rol: 'ResponsableArea',
          cargo: r.cargo,
          dependencia_id: depDoc ? depDoc._id : null,
          activo: true
        });
      }
      if (depDoc && (!depDoc.responsable_id || depDoc.responsable_id.toString() !== resp._id.toString())) {
        depDoc.responsable_id = resp._id;
        await depDoc.save();
      }
      responsablesDocs[r.dep] = resp;
    }

    // 5. Contratistas
    console.log('Creando contratistas...');
    const contratistasData = [
      {
        nombre_completo: 'Juan Carlos Pérez Gómez',
        correo_institucional: 'juan.perez@correo.com',
        documento: '1098765432',
        cargo: 'Desarrollador Full-Stack Senior',
        telefono: '3101234567',
        supervisor: supervisoresDocs[0]._id
      },
      {
        nombre_completo: 'Laura Andrea Contratista',
        correo_institucional: 'contratista@gccon.com',
        documento: '1095432189',
        cargo: 'Especialista en Soporte Informático',
        telefono: '3157654321',
        supervisor: supervisoresDocs[0]._id
      },
      {
        nombre_completo: 'María Fernanda Gómez Ruiz',
        correo_institucional: 'maria.gomez@correo.com',
        documento: '1094321765',
        cargo: 'Instructora Contratista en Telemática',
        telefono: '3207654321',
        supervisor: supervisoresDocs[1]._id
      },
      {
        nombre_completo: 'Carlos Eduardo Mendoza',
        correo_institucional: 'carlos.mendoza@email.com',
        documento: '1097890123',
        cargo: 'Consultor en Redes y Telecomunicaciones',
        telefono: '3119876543',
        supervisor: supervisoresDocs[1]._id
      },
      {
        nombre_completo: 'Diego Morales Castro',
        correo_institucional: 'diego.morales@correo.com',
        documento: '1096543210',
        cargo: 'Técnico de Mantenimiento de Hardware',
        telefono: '3171234567',
        supervisor: supervisoresDocs[2]._id
      }
    ];

    const contratistasDocs = [];
    for (const c of contratistasData) {
      let con = await Usuario.findOne({ correo_institucional: c.correo_institucional });
      if (!con) {
        con = await Usuario.create({
          nombre_completo: c.nombre_completo,
          correo_institucional: c.correo_institucional,
          password_hash: passComun,
          rol: 'Contratista',
          cargo: c.cargo,
          telefono: c.telefono,
          supervisor_id: c.supervisor,
          activo: true
        });
      }
      contratistasDocs.push({ ...c, doc: con });
    }

    // 6. Contratos y Solicitudes Paz y Salvo GCCON-F-088
    console.log('Creando contratos y solicitudes con trazabilidad...');
    const contratosData = [
      {
        numero_contrato: 'CNT-2025-088',
        nombre_contratista: 'Juan Carlos Pérez Gómez',
        correo_contratista: 'juan.perez@correo.com',
        telefono: '3101234567',
        dependencia: dependenciasDocs['Gestión Tecnológica (TIC)']._id,
        usuario: contratistasDocs[0].doc._id,
        supervisor: supervisoresDocs[0]._id,
        estado: 'Pendiente de Firmas',
        observaciones_supervisor: 'Cumplimiento contractual al 100%. Bienes entregados para revisión.',
        bienes: [
          { descripcion: 'Portátil Dell Latitude 5420 i7 16GB', codigo_inventario: 'TIC-INV-45210', cantidad: 1, estado_bien: 'Bueno' },
          { descripcion: 'Token de Seguridad VPN Fortinet', codigo_inventario: 'TIC-INV-45211', cantidad: 1, estado_bien: 'Bueno' }
        ],
        firmas: [
          { dep: 'Gestión Tecnológica (TIC)', estado: 'Aprobado', firmada: true },
          { dep: 'Almacén e Inventarios', estado: 'Pendiente', firmada: false },
          { dep: 'Recursos Humanos / Talento Humano', estado: 'Pendiente', firmada: false }
        ]
      },
      {
        numero_contrato: 'CNT-2026-014',
        nombre_contratista: 'Laura Andrea Contratista',
        correo_contratista: 'contratista@gccon.com',
        telefono: '3157654321',
        dependencia: dependenciasDocs['Almacén e Inventarios']._id,
        usuario: contratistasDocs[1].doc._id,
        supervisor: supervisoresDocs[0]._id,
        estado: 'Aprobado',
        observaciones_supervisor: 'Entrega formal de cargo y herramientas realizada a conformidad.',
        bienes: [
          { descripcion: 'Juego de herramientas de precisión y tester de red', codigo_inventario: 'ALM-HERR-109', cantidad: 1, estado_bien: 'Bueno' },
          { descripcion: 'Carné institucional y chaleco SENA', codigo_inventario: 'RRHH-DOT-2026', cantidad: 1, estado_bien: 'Bueno' }
        ],
        firmas: [
          { dep: 'Gestión Tecnológica (TIC)', estado: 'Aprobado', firmada: true },
          { dep: 'Almacén e Inventarios', estado: 'Aprobado', firmada: true },
          { dep: 'Recursos Humanos / Talento Humano', estado: 'Aprobado', firmada: true },
          { dep: 'Biblioteca y Archivo', estado: 'Aprobado', firmada: true }
        ]
      },
      {
        numero_contrato: 'CNT-2026-029',
        nombre_contratista: 'María Fernanda Gómez Ruiz',
        correo_contratista: 'maria.gomez@correo.com',
        telefono: '3207654321',
        dependencia: dependenciasDocs['Recursos Humanos / Talento Humano']._id,
        usuario: contratistasDocs[2].doc._id,
        supervisor: supervisoresDocs[1]._id,
        estado: 'EnProceso',
        observaciones_supervisor: 'En trámite de revisión de informes técnicos finales.',
        bienes: [
          { descripcion: 'Kit de laboratorio telemático Cisco Packet Tracer', codigo_inventario: 'TIC-KIT-884', cantidad: 1, estado_bien: 'Bueno' }
        ],
        firmas: [
          { dep: 'Gestión Tecnológica (TIC)', estado: 'Pendiente', firmada: false },
          { dep: 'Almacén e Inventarios', estado: 'Pendiente', firmada: false }
        ]
      },
      {
        numero_contrato: 'CNT-2026-042',
        nombre_contratista: 'Carlos Eduardo Mendoza',
        correo_contratista: 'carlos.mendoza@email.com',
        telefono: '3119876543',
        dependencia: dependenciasDocs['Gestión Tecnológica (TIC)']._id,
        usuario: contratistasDocs[3].doc._id,
        supervisor: supervisoresDocs[1]._id,
        estado: 'Finalizado',
        observaciones_supervisor: 'Paz y salvo emitido y certificado oficial GCCON-F-088 generado con éxito.',
        bienes: [
          { descripcion: 'Consola de administración y switch de pruebas', codigo_inventario: 'TIC-SW-032', cantidad: 1, estado_bien: 'Bueno' }
        ],
        firmas: [
          { dep: 'Gestión Tecnológica (TIC)', estado: 'Aprobado', firmada: true },
          { dep: 'Almacén e Inventarios', estado: 'Aprobado', firmada: true },
          { dep: 'Recursos Humanos / Talento Humano', estado: 'Aprobado', firmada: true },
          { dep: 'Biblioteca y Archivo', estado: 'Aprobado', firmada: true }
        ]
      },
      {
        numero_contrato: 'CNT-2026-055',
        nombre_contratista: 'Diego Morales Castro',
        correo_contratista: 'diego.morales@correo.com',
        telefono: '3171234567',
        dependencia: dependenciasDocs['Infraestructura y Servicios Generales']._id,
        usuario: contratistasDocs[4].doc._id,
        supervisor: supervisoresDocs[2]._id,
        estado: 'Pendiente de Firmas',
        observaciones_supervisor: 'Contratista entregó puesto de trabajo. Pendiente firma de almacén.',
        bienes: [
          { descripcion: 'Llaves de acceso taller y tarjeta magnética', codigo_inventario: 'INF-KEY-201', cantidad: 2, estado_bien: 'Bueno' }
        ],
        firmas: [
          { dep: 'Infraestructura y Servicios Generales', estado: 'Aprobado', firmada: true },
          { dep: 'Almacén e Inventarios', estado: 'Pendiente', firmada: false }
        ]
      }
    ];

    for (const c of contratosData) {
      let contratoDoc = await Contrato.findOne({ numero_contrato: c.numero_contrato });
      if (!contratoDoc) {
        contratoDoc = await Contrato.create({
          numero_contrato: c.numero_contrato,
          nombre_contratista: c.nombre_contratista,
          correo_contratista: c.correo_contratista,
          telefono: c.telefono,
          dependencia: c.dependencia,
          usuario: c.usuario,
          supervisor: c.supervisor,
          estado: c.estado,
          observaciones_supervisor: c.observaciones_supervisor,
          version_formato: 1
        });
        console.log(`Contrato creado: ${c.numero_contrato}`);
      }

      // Bienes
      for (const b of c.bienes) {
        const existeBien = await BienEntregado.findOne({
          contrato_id: contratoDoc._id,
          codigo_inventario: b.codigo_inventario
        });
        if (!existeBien) {
          await BienEntregado.create({
            contrato_id: contratoDoc._id,
            ...b
          });
        }
      }

      // Trazabilidad de firmas
      for (const f of c.firmas) {
        const depDoc = dependenciasDocs[f.dep];
        if (!depDoc) continue;
        const respDoc = responsablesDocs[f.dep];
        const existeFirma = await TrazabilidadFirma.findOne({
          contrato_id: contratoDoc._id,
          area_id: depDoc._id
        });
        if (!existeFirma) {
          const hashMock = f.firmada
            ? crypto.createHash('sha256').update(`${contratoDoc.numero_contrato}-${f.dep}-${Date.now()}`).digest('hex')
            : '';
          await TrazabilidadFirma.create({
            contrato_id: contratoDoc._id,
            area_id: depDoc._id,
            usuario_id: respDoc ? respDoc._id : null,
            estado: f.estado,
            hash_verificacion: hashMock,
            fecha_firma: f.firmada ? new Date() : null
          });
        }
      }
    }

    console.log('\n=========================================');
    console.log('🎉 BASE DE DATOS ATLAS POBLADA CON ÉXITO');
    console.log('=========================================');
    console.log('✓ 6 Dependencias creadas/verificadas');
    console.log('✓ 2 Administradores (admin@gccon.com, paula.admin@gccon.com)');
    console.log('✓ 3 Supervisores (supervisor@gccon.com, agomez@sena.edu.co, f.ramirez@sena.edu.co)');
    console.log('✓ 4 Responsables de Área (area.almacen@gccon.com, area.tic@gccon.com, rrhh@sena.edu.co, biblioteca@sena.edu.co)');
    console.log('✓ 5 Contratistas (contratista@gccon.com, juan.perez@correo.com, maria.gomez@correo.com, etc.)');
    console.log('✓ 5 Contratos y Solicitudes GCCON-F-088 en múltiples estados');
    console.log('Contraseña general de prueba para todos: 12345678 (admin: Admin1234!)');

    process.exit(0);
  } catch (error) {
    console.error('Error al poblar base de datos:', error);
    process.exit(1);
  }
}

seedFullData();
