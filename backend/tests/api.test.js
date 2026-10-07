process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret';
process.env.EMAIL_USER = '';
process.env.EMAIL_PASS = '';
process.env.RATE_LIMIT_MAX = '1000';
process.env.CORS_ORIGIN = '';

const mongoose = require('mongoose');
const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../src/app');

const Usuario = require('../src/models/Usuario');
const DependenciaArea = require('../src/models/DependenciaArea');
const Contrato = require('../src/models/Contrato');
const BienEntregado = require('../src/models/BienEntregado');
const TrazabilidadFirma = require('../src/models/TrazabilidadFirma');

const TEST_DB = 'mongodb://127.0.0.1:27017/pazysalvo_sena_test';
const PASS = 'ClaveSegura123!';

let admin, supervisor, contratista, responsable, area;

async function login(correo, password = PASS) {
  return request(app).post('/api/auth/login').send({ correo_institucional: correo, password });
}

beforeAll(async () => {
  await mongoose.connect(TEST_DB);
  await mongoose.connection.dropDatabase();

  const hash = await bcrypt.hash(PASS, 8);

  area = await DependenciaArea.create({ nombre_dependencia: 'Area Prueba', activo: true });

  admin = await Usuario.create({ nombre_completo: 'Admin Test', correo_institucional: 'admin.test@institucion.edu.co', password_hash: hash, rol: 'Administrador' });
  supervisor = await Usuario.create({ nombre_completo: 'Supervisor Test', correo_institucional: 'sup.test@institucion.edu.co', password_hash: hash, rol: 'Supervisor' });
  contratista = await Usuario.create({ nombre_completo: 'Contratista Test', correo_institucional: 'cont.test@empresa.edu', password_hash: hash, rol: 'Contratista', supervisor_id: supervisor._id });
  responsable = await Usuario.create({ nombre_completo: 'Responsable Test', correo_institucional: 'resp.test@institucion.edu.co', password_hash: hash, rol: 'ResponsableArea', dependencia_id: area._id });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

describe('Autenticación (Flujo 1)', () => {
  test('login exitoso devuelve token y rol', async () => {
    const res = await login(admin.correo_institucional);
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.usuario.rol).toBe('Administrador');
  });

  test('login con credenciales inválidas devuelve 401', async () => {
    const res = await login('noexiste@institucion.edu.co');
    expect(res.status).toBe(401);
  });

  test('usuario deshabilitado no puede iniciar sesión', async () => {
    await Usuario.create({ nombre_completo: 'Inactivo', correo_institucional: 'inactivo@institucion.edu.co', password_hash: await bcrypt.hash(PASS, 8), rol: 'Contratista', activo: false });
    const res = await login('inactivo@institucion.edu.co');
    expect(res.status).toBe(401);
  });

  test('bloqueo tras 3 intentos fallidos (403)', async () => {
    await Usuario.create({ nombre_completo: 'Bloqueo', correo_institucional: 'bloqueo@institucion.edu.co', password_hash: await bcrypt.hash(PASS, 8), rol: 'Contratista' });
    for (let i = 0; i < 3; i++) {
      await login('bloqueo@institucion.edu.co', 'ClaveMala123!');
    }
    const res = await login('bloqueo@institucion.edu.co', 'ClaveMala123!');
    expect(res.status).toBe(403);
  });
});

describe('Jerarquía de usuarios (RF-009, RF-011)', () => {
  test('admin crea supervisor (201)', async () => {
    const token = (await login(admin.correo_institucional)).body.token;
    const res = await request(app).post('/api/usuarios').set('Authorization', `Bearer ${token}`).send({ nombre_completo: 'Sup Nuevo', correo_institucional: 'sup.nuevo@institucion.edu.co', password: PASS, rol: 'Supervisor' });
    expect(res.status).toBe(201);
  });

  test('supervisor crea contratista (201)', async () => {
    const token = (await login(supervisor.correo_institucional)).body.token;
    const res = await request(app).post('/api/usuarios').set('Authorization', `Bearer ${token}`).send({ nombre_completo: 'Cont Nuevo', correo_institucional: 'cont.nuevo@empresa.edu', password: PASS, rol: 'Contratista' });
    expect(res.status).toBe(201);
  });

  test('supervisor NO crea administrador (403)', async () => {
    const token = (await login(supervisor.correo_institucional)).body.token;
    const res = await request(app).post('/api/usuarios').set('Authorization', `Bearer ${token}`).send({ nombre_completo: 'X', correo_institucional: 'x@institucion.edu.co', password: PASS, rol: 'Administrador' });
    expect(res.status).toBe(403);
  });

  test('contraseña débil es rechazada (400)', async () => {
    const token = (await login(supervisor.correo_institucional)).body.token;
    const res = await request(app).post('/api/usuarios').set('Authorization', `Bearer ${token}`).send({ nombre_completo: 'Debil', correo_institucional: 'debil@empresa.edu', password: 'abc', rol: 'Contratista' });
    expect(res.status).toBe(400);
  });
});

describe('Flujo contractual completo (Flujos 2-4)', () => {
  let contratoId;
  let tokenC, tokenS, tokenR, tokenA;

  beforeAll(async () => {
    tokenA = (await login(admin.correo_institucional)).body.token;
    tokenS = (await login(supervisor.correo_institucional)).body.token;
    tokenC = (await login(contratista.correo_institucional)).body.token;
    tokenR = (await login(responsable.correo_institucional)).body.token;
  });

  test('crear contrato con bienes (201)', async () => {
    const res = await request(app).post('/api/contratos/nuevo').set('Authorization', `Bearer ${tokenC}`).send({
      numero: 'CT-TEST-001', telefono: '3001112233', dependencia: area._id.toString(),
      bienes: [{ descripcion: 'Laptop', codigo_inventario: 'INV-T-1', estado_bien: 'Bueno' }]
    });
    expect(res.status).toBe(201);
    contratoId = res.body.contrato._id;
  });

  test('rechaza bien sin código (400)', async () => {
    const res = await request(app).post('/api/contratos/nuevo').set('Authorization', `Bearer ${tokenC}`).send({
      numero: 'CT-TEST-002', telefono: '300', dependencia: area._id.toString(),
      bienes: [{ descripcion: 'Sin código' }]
    });
    expect(res.status).toBe(400);
  });

  test('admin no puede evaluar (403)', async () => {
    const res = await request(app).put(`/api/contratos/evaluar/${contratoId}`).set('Authorization', `Bearer ${tokenA}`).send({ aprobado: true });
    expect(res.status).toBe(403);
  });

  test('supervisor evalúa y abre firmas (200)', async () => {
    const res = await request(app).put(`/api/contratos/evaluar/${contratoId}`).set('Authorization', `Bearer ${tokenS}`).send({ aprobado: true });
    expect(res.status).toBe(200);
    expect(res.body.contrato.estado).toBe('Pendiente de Firmas');
  });

  test('responsable aprueba firma y finaliza (200)', async () => {
    const res = await request(app).post('/api/firmas/procesar').set('Authorization', `Bearer ${tokenR}`).send({ contratoId, accion: 'Aprobar' });
    expect(res.status).toBe(200);
    const c = await Contrato.findById(contratoId);
    expect(c.estado).toBe('Finalizado');
  });

  test('contratista consulta sus solicitudes (200)', async () => {
    const res = await request(app).get('/api/contratos/mis-solicitudes').set('Authorization', `Bearer ${tokenC}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('descargar PDF (200)', async () => {
    const res = await request(app).get(`/api/contratos/${contratoId}/pdf`).set('Authorization', `Bearer ${tokenC}`);
    expect(res.status).toBe(200);
  });
});

describe('Recuperación y cambio de contraseña (Flujo 5, RF-015)', () => {
  test('recuperar genera token efímero', async () => {
    const res = await request(app).post('/api/auth/recuperar').send({ correo_institucional: contratista.correo_institucional });
    expect(res.status).toBe(200);
    const u = await Usuario.findOne({ correo_institucional: contratista.correo_institucional });
    expect(u.token_recuperacion).toBeTruthy();
  });

  test('restablecer con token válido (200)', async () => {
    const u = await Usuario.findOne({ correo_institucional: contratista.correo_institucional });
    const res = await request(app).post('/api/auth/restablecer').send({ token: u.token_recuperacion, nueva_password: 'NuevaClave123!' });
    expect(res.status).toBe(200);
  });

  test('cambiar contraseña con política (200/400)', async () => {
    const token = (await login(contratista.correo_institucional, 'NuevaClave123!')).body.token;
    const debil = await request(app).put('/api/auth/cambiar-password').set('Authorization', `Bearer ${token}`).send({ password_actual: 'NuevaClave123!', nueva_password: 'corta' });
    expect(debil.status).toBe(400);
  });
});
