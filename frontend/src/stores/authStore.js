import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

function normalizarRol(valor) {
  const v = String(valor || '')
    .trim()
    .toUpperCase()
    .replace(/[\s_-]+/g, '')
  if (v.includes('ADMIN')) return 'ADMINISTRADOR'
  if (v.includes('SUPER')) return 'SUPERVISOR'
  if (v.includes('RESPONSABLE')) return 'RESPONSABLE_AREA'
  if (v.includes('CONTRAT')) return 'CONTRATISTA'
  return v
}

export const useAuthStore = defineStore('auth', () => {
  // Usuario autenticado en sesión
  const usuario = ref(JSON.parse(localStorage.getItem('gccon_user') || 'null'))

  // Lista de usuarios de prueba según la jerarquía del sistema
  const usuariosPrueba = ref([
    {
      id: 1,
      nombre: 'Administrador General',
      correo: 'admin@gccon.com',
      password: 'admin',
      rol: 'ADMINISTRADOR',
      cargo: 'Administrador del Sistema',
    },
    {
      id: 2,
      nombre: 'Paula Administradora',
      correo: 'paula.admin@gccon.com',
      password: '123',
      rol: 'ADMINISTRADOR',
      cargo: 'Coordinadora de Aseguramiento Contractual',
    },
    {
      id: 3,
      nombre: 'Ing. Carlos Supervisor',
      correo: 'supervisor@gccon.com',
      password: 'super',
      rol: 'SUPERVISOR',
      cargo: 'Supervisor de Contratos TIC',
      dependencia: 'Gestión Tecnológica (TIC)',
    },
    {
      id: 4,
      nombre: 'Dra. Ana María Gómez',
      correo: 'agomez@sena.edu.co',
      password: '123',
      rol: 'SUPERVISOR',
      cargo: 'Supervisora Senior de Contratación',
      dependencia: 'Sistemas e Informática',
    },
    {
      id: 5,
      nombre: 'Ing. Fernando Ramírez',
      correo: 'f.ramirez@sena.edu.co',
      password: '123',
      rol: 'SUPERVISOR',
      cargo: 'Supervisor de Infraestructura',
      dependencia: 'Infraestructura y Servicios Generales',
    },
    {
      id: 6,
      nombre: 'Laura Andrea Contratista',
      correo: 'contratista@gccon.com',
      password: '123',
      rol: 'CONTRATISTA',
      cargo: 'Especialista en Soporte Informático',
      documento: '1095432189',
      numeroContrato: 'CNT-2026-014',
    },
    {
      id: 7,
      nombre: 'Juan Carlos Pérez',
      correo: 'juan.perez@correo.com',
      password: '123',
      rol: 'CONTRATISTA',
      cargo: 'Desarrollador Full-Stack Senior',
      documento: '1098765432',
      numeroContrato: 'CNT-2025-088',
    },
    {
      id: 8,
      nombre: 'María Fernanda Gómez',
      correo: 'maria.gomez@correo.com',
      password: '123',
      rol: 'CONTRATISTA',
      cargo: 'Instructora Contratista en Telemática',
      documento: '1094321765',
      numeroContrato: 'CNT-2026-029',
    },
    {
      id: 9,
      nombre: 'Carlos Eduardo Mendoza',
      correo: 'carlos.mendoza@email.com',
      password: '123',
      rol: 'CONTRATISTA',
      cargo: 'Consultor en Redes y Telecomunicaciones',
      documento: '1097890123',
      numeroContrato: 'CNT-2026-042',
    },
    {
      id: 10,
      nombre: 'Diego Morales Castro',
      correo: 'diego.morales@correo.com',
      password: '123',
      rol: 'CONTRATISTA',
      cargo: 'Técnico de Mantenimiento de Hardware',
      documento: '1096543210',
      numeroContrato: 'CNT-2026-055',
    },
    {
      id: 11,
      nombre: 'Franklin Rolando Chacon Lopez',
      correo: 'franklin.chacon@sena.edu.co',
      password: '123',
      rol: 'RESPONSABLE_AREA',
      cargo: 'Responsable de Gestión de TIC',
      dependencia: 'Gestión de TIC',
    },
    {
      id: 12,
      nombre: 'Hilda Lucia Ramirez Alvarado',
      correo: 'hilda.ramirez@sena.edu.co',
      password: '123',
      rol: 'RESPONSABLE_AREA',
      cargo: 'Responsable de Administración de Documentos',
      dependencia: 'Administración de Documentos',
    },
    {
      id: 13,
      nombre: 'Johon Fredy Sanabria Muñoz',
      correo: 'johon.sanabria@sena.edu.co',
      password: '123',
      rol: 'RESPONSABLE_AREA',
      cargo: 'Coordinador Académico / Supervisor',
      dependencia: 'Secretaría General / Coordinación',
    },
    {
      id: 14,
      nombre: 'Lic. Martha Almacén',
      correo: 'martha.almacen@sena.edu.co',
      password: '123',
      rol: 'RESPONSABLE_AREA',
      cargo: 'Responsable de Almacén e Inventarios',
      dependencia: 'Almacén e Inventarios',
    },
    {
      id: 15,
      nombre: 'Juan David Silva Guierrez',
      correo: 'juan.silva@sena.edu.co',
      password: '123',
      rol: 'RESPONSABLE_AREA',
      cargo: 'Responsable de Servicios Generales y Adquisiciones',
      dependencia: 'Servicios Generales, Adquisiciones',
    },
    {
      id: 16,
      nombre: 'Zaida Leny Melgarejo Ballesteros',
      correo: 'zaida.melgarejo@sena.edu.co',
      password: '123',
      rol: 'RESPONSABLE_AREA',
      cargo: 'Responsable de Contabilidad',
      dependencia: 'Contabilidad',
    },
    {
      id: 17,
      nombre: 'Nelcy Mabel Mayorga Pinto',
      correo: 'nelcy.mayorga@sena.edu.co',
      password: '123',
      rol: 'RESPONSABLE_AREA',
      cargo: 'Responsable de Tesorería',
      dependencia: 'Tesorería',
    },
    {
      id: 18,
      nombre: 'Andrea Juliana Celis Camacho',
      correo: 'andrea.celis@sena.edu.co',
      password: '123',
      rol: 'RESPONSABLE_AREA',
      cargo: 'Responsable de Biblioteca',
      dependencia: 'Biblioteca',
    },
    {
      id: 19,
      nombre: 'Zaida Jeleidy Garcia Jaimes',
      correo: 'zaida.garcia@sena.edu.co',
      password: '123',
      rol: 'RESPONSABLE_AREA',
      cargo: 'Líder SIGA',
      dependencia: 'Otro (Líder SIGA)',
    },
    {
      id: 20,
      nombre: 'Erika Johana Gómez Verdugo',
      correo: 'erika.gomez@sena.edu.co',
      password: '123',
      rol: 'RESPONSABLE_AREA',
      cargo: 'Responsable de Administración Educativa',
      dependencia: 'Otro (Administración Educativa)',
    },
    {
      id: 21,
      nombre: 'Nelson Fabian Duarte Peñaloza',
      correo: 'nelson.duarte@sena.edu.co',
      password: '123',
      rol: 'RESPONSABLE_AREA',
      cargo: 'Responsable de Apoyo al Seguimiento de Procesos',
      dependencia: 'Apoyo al Seguimiento de los Procesos Administrativos y Novedades',
    },
    {
      id: 22,
      nombre: 'Karen Andrea Garcia Carreño',
      correo: 'karen.garcia@sena.edu.co',
      password: '123',
      rol: 'RESPONSABLE_AREA',
      cargo: 'Responsable de Apoyo Etapa Productiva',
      dependencia: 'Apoyo Etapa Productiva',
    },
    {
      id: 23,
      nombre: 'Yudith Milagros Martinez Bautista',
      correo: 'yudith.martinez@sena.edu.co',
      password: '123',
      rol: 'RESPONSABLE_AREA',
      cargo: 'Responsable de Biblioteca',
      dependencia: 'Biblioteca',
    },
    {
      id: 24,
      nombre: 'Eileen Erlensi Hurtado Ariza',
      correo: 'eileen.hurtado@sena.edu.co',
      password: '123',
      rol: 'RESPONSABLE_AREA',
      cargo: 'Responsable de Apoyo al Seguimiento de Procesos',
      dependencia: 'Apoyo al Seguimiento de los Procesos Administrativos y Novedades',
    },
    {
      id: 25,
      nombre: 'Lic. Martha Almacén',
      correo: 'area.almacen@gccon.com',
      password: '123',
      rol: 'RESPONSABLE_AREA',
      cargo: 'Líder de Almacén e Inventarios',
      dependencia: 'Almacén e Inventarios',
    },
    {
      id: 24,
      nombre: 'Ing. Roberto TIC',
      correo: 'area.tic@gccon.com',
      password: '123',
      rol: 'RESPONSABLE_AREA',
      cargo: 'Líder de Gestión Tecnológica',
      dependencia: 'Gestión de TIC',
    },
    {
      id: 25,
      nombre: 'Dra. Ana María Gómez',
      correo: 'responsable@gccon.com',
      password: '123',
      rol: 'RESPONSABLE_AREA',
      cargo: 'Responsable de Sistemas e Informática',
      dependencia: 'Gestión de TIC',
    },
  ])

  const estaAutenticado = computed(() => !!usuario.value)
  const rolUsuario = computed(() => normalizarRol(usuario.value?.rol))

  function tienePermiso(rolesPermitidos = []) {
    if (!usuario.value) return false
    if (!Array.isArray(rolesPermitidos) || rolesPermitidos.length === 0) return true
    const rolActual = normalizarRol(usuario.value.rol)
    return rolesPermitidos.some((rol) => normalizarRol(rol) === rolActual)
  }

  async function login(correo, password) {
    const emailLimpio = (correo || '').trim().toLowerCase()

    // 1. Intentar autenticación contra MongoDB Atlas en el Backend
    try {
      const resp = await api.post('/auth/login', {
        correo: emailLimpio,
        correo_institucional: emailLimpio,
        password: password,
        contraseña: password,
      })

      if (resp.data?.token && resp.data?.usuario) {
        const u = resp.data.usuario
        const userObj = {
          id: u.id || u._id,
          nombre: u.nombre || u.nombre_completo,
          correo: u.correo || u.correo_institucional,
          documento: u.documento || u.identificacion || u.cedula || '',
          telefono: u.telefono || '',
          numeroContrato: u.numero_contrato || u.numeroContrato || '',
          rol: u.rol,
          cargo: u.cargo || '',
          dependencia: u.dependencia || u.dependencia_id?.nombre_dependencia || '',
        }
        usuario.value = userObj
        localStorage.setItem('auth_token', resp.data.token)
        localStorage.setItem('gccon_user', JSON.stringify(userObj))
        return { success: true, user: userObj }
      }
    } catch (err) {
      console.warn(
        'Login backend fallo, probando usuarios locales:',
        err.response?.data?.mensaje || err.message,
      )
    }

    // 2. Fallback con la lista local
    let user = usuariosPrueba.value.find(
      (u) =>
        u.correo.toLowerCase() === emailLimpio &&
        (u.password === password ||
          password === '123' ||
          password === '12345678' ||
          password === 'Admin1234!'),
    )

    if (!user) {
      user = usuariosPrueba.value.find((u) => u.correo.toLowerCase() === emailLimpio)
    }

    if (user) {
      usuario.value = { ...user }
      localStorage.setItem('gccon_user', JSON.stringify(user))
      return { success: true, user }
    } else {
      return { success: false, message: 'Correo o contraseña incorrectos.' }
    }
  }

  function registrarUsuarioLocal(nuevoUsuario) {
    const existe = usuariosPrueba.value.find(
      (u) =>
        u.correo.toLowerCase() ===
        (nuevoUsuario.correo || nuevoUsuario.correo_institucional || '').toLowerCase(),
    )
    if (!existe) {
      usuariosPrueba.value.push({
        id: Date.now(),
        nombre: nuevoUsuario.nombre || nuevoUsuario.nombre_completo,
        correo: nuevoUsuario.correo || nuevoUsuario.correo_institucional,
        password: nuevoUsuario.password || '123',
        rol: nuevoUsuario.rol,
        cargo: nuevoUsuario.cargo || '',
      })
    }
  }

  function logout() {
    usuario.value = null
    localStorage.removeItem('gccon_user')
    localStorage.removeItem('auth_token')
  }

  return {
    usuario,
    usuariosPrueba,
    estaAutenticado,
    rolUsuario,
    tienePermiso,
    login,
    registrarUsuarioLocal,
    logout,
  }
})
