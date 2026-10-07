import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export const useContratistasStore = defineStore('contratistas', () => {
  const contratistas = ref([])
  const cargando = ref(false)

  const contratistasBase = [
    {
      documento: '1098765432',
      nombre: 'Juan Carlos Pérez Gómez',
      numeroContrato: 'CNT-2026-001',
      correo: 'juan.perez@correo.com',
      telefono: '3101234567',
      cargo: 'Desarrollador Full-Stack Senior',
      supervisor: 'Ing. Carlos Supervisor',
      dependencia: 'Gestión Tecnológica (TIC)',
      password: '123',
    },
    {
      documento: '1095432189',
      nombre: 'Laura Andrea Contratista',
      numeroContrato: 'CNT-2026-002',
      correo: 'contratista@gccon.com',
      telefono: '3157654321',
      cargo: 'Especialista en Soporte Informático',
      supervisor: 'Ing. Carlos Supervisor',
      dependencia: 'Gestión Tecnológica (TIC)',
      password: '123',
    },
    {
      documento: '1094321765',
      nombre: 'María Fernanda Gómez Ruiz',
      numeroContrato: 'CNT-2026-003',
      correo: 'maria.gomez@correo.com',
      telefono: '3207654321',
      cargo: 'Instructora Contratista en Telemática',
      supervisor: 'Dra. Ana María Gómez',
      dependencia: 'Sistemas e Informática',
      password: '123',
    },
    {
      documento: '1097890123',
      nombre: 'Carlos Eduardo Mendoza',
      numeroContrato: 'CNT-2026-004',
      correo: 'carlos.mendoza@email.com',
      telefono: '3119876543',
      cargo: 'Consultor en Redes y Telecomunicaciones',
      supervisor: 'Ing. Carlos Supervisor',
      dependencia: 'Gestión Tecnológica (TIC)',
      password: '123',
    },
    {
      documento: '1096543210',
      nombre: 'Diego Morales Castro',
      numeroContrato: 'CNT-2026-005',
      correo: 'diego.morales@correo.com',
      telefono: '3171234567',
      cargo: 'Técnico de Mantenimiento de Hardware',
      supervisor: 'Ing. Fernando Ramírez',
      dependencia: 'Infraestructura y Servicios Generales',
      password: '123',
    },
  ]

  contratistas.value = [...contratistasBase]

  async function cargarContratistas() {
    cargando.value = true
    try {
      const resp = await api.get('/usuarios?rol=Contratista')
      const lista = Array.isArray(resp.data) ? resp.data : resp.data?.usuarios || []
      if (Array.isArray(lista)) {
        const desdeAtlas = lista.map((u, idx) => ({
          _id: (u._id || u.id || `con_${idx}`).toString(),
          id: (u._id || u.id || `con_${idx}`).toString(),
          documento: u.documento || u.telefono || `DOC-C${idx + 1}`,
          nombre: u.nombre_completo || u.nombre,
          numeroContrato: u.numero_contrato || u.contrato || `CNT-2026-0${idx + 1}`,
          correo: u.correo_institucional || u.correo,
          telefono: u.telefono || '3100000000',
          cargo: u.cargo || 'Contratista',
          supervisor: u.supervisor || u.supervisor_id?.nombre_completo || 'Ing. Carlos Supervisor',
          supervisor_id: u.supervisor_id?._id || u.supervisor_id || null,
          dependencia:
            u.dependencia || u.dependencia_id?.nombre_dependencia || 'Gestión Tecnológica (TIC)',
          dependencia_id: u.dependencia_id?._id || u.dependencia_id || null,
          password: '123',
        }))

        const mapa = new Map()
        // MongoDB Atlas primero para que los nuevos queden arriba
        desdeAtlas.forEach((c) => mapa.set(c.correo.toLowerCase(), c))
        contratistasBase.forEach((c) => {
          if (!mapa.has(c.correo.toLowerCase())) {
            mapa.set(c.correo.toLowerCase(), c)
          }
        })
        contratistas.value = Array.from(mapa.values())
      }
    } catch (err) {
      console.warn('Cargando contratistas locales:', err.message)
    } finally {
      cargando.value = false
    }
  }

  // Cargar inmediatamente
  cargarContratistas()

  async function agregar(nuevoContratista) {
    try {
      await api.post('/usuarios', {
        nombre: nuevoContratista.nombre,
        nombre_completo: nuevoContratista.nombre,
        correo: nuevoContratista.correo,
        correo_institucional: nuevoContratista.correo,
        documento: nuevoContratista.documento,
        telefono: nuevoContratista.telefono,
        numero_contrato: nuevoContratista.numeroContrato,
        contrato: nuevoContratista.numeroContrato,
        supervisor: nuevoContratista.supervisor,
        supervisor_id: nuevoContratista.supervisor_id,
        dependencia: nuevoContratista.dependencia,
        dependencia_id: nuevoContratista.dependencia_id,
        cargo: nuevoContratista.cargo || 'Contratista',
        password: nuevoContratista.password,
        rol: 'Contratista',
      })
      await cargarContratistas()
    } catch (err) {
      console.error('Error al guardar contratista en Atlas:', err)
      throw err
    }
  }

  async function editar(indice, datosActualizados) {
    if (indice !== -1 && indice < contratistas.value.length) {
      contratistas.value[indice] = datosActualizados
      try {
        const idParaApi = datosActualizados._id || datosActualizados.id
        if (idParaApi) {
          await api.put(`/usuarios/${idParaApi}`, {
            nombre_completo: datosActualizados.nombre,
            telefono: datosActualizados.telefono,
            numero_contrato: datosActualizados.numeroContrato,
            contrato: datosActualizados.numeroContrato,
            supervisor: datosActualizados.supervisor,
            supervisor_id: datosActualizados.supervisor_id,
            dependencia: datosActualizados.dependencia,
            dependencia_id: datosActualizados.dependencia_id,
            cargo: datosActualizados.cargo,
          })
        }
      } catch (err) {
        console.warn('Actualización de contratista en Atlas falló, guardado local:', err.message)
      }
    }
  }

  async function eliminar(documento) {
    const itemEncontrado = contratistas.value.find((item) => item.documento === documento)
    contratistas.value = contratistas.value.filter((item) => item.documento !== documento)

    try {
      const idParaBorrar = itemEncontrado?._id || itemEncontrado?.id || documento
      await api.delete(`/usuarios/${idParaBorrar}`)
    } catch (err) {
      console.error('Error al eliminar contratista en Atlas:', err)
    }
  }

  return {
    contratistas,
    cargando,
    cargarContratistas,
    agregar,
    editar,
    eliminar,
  }
})
