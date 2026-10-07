import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export const useSupervisoresStore = defineStore('supervisores', () => {
  const supervisores = ref([])
  const cargando = ref(false)

  const supervisoresBase = [
    {
      documento: '1098765432',
      nombre: 'Ing. Carlos Supervisor',
      correo: 'supervisor@gccon.com',
      telefono: '3101234567',
      cargo: 'Supervisor de Contratos TIC',
      dependencia: 'Gestión Tecnológica (TIC)',
      password: '123',
    },
    {
      documento: '1097654321',
      nombre: 'Dra. Ana María Gómez',
      correo: 'agomez@sena.edu.co',
      telefono: '3187654321',
      cargo: 'Supervisora Senior de Contratación',
      dependencia: 'Sistemas e Informática',
      password: '123',
    },
    {
      documento: '1096543219',
      nombre: 'Ing. Fernando Ramírez',
      correo: 'f.ramirez@sena.edu.co',
      telefono: '3209876543',
      cargo: 'Supervisor de Infraestructura y Obras',
      dependencia: 'Infraestructura y Servicios Generales',
      password: '123',
    },
  ]

  supervisores.value = [...supervisoresBase]

  async function cargarSupervisores() {
    cargando.value = true
    try {
      const resp = await api.get('/usuarios?rol=Supervisor')
      const lista = Array.isArray(resp.data) ? resp.data : resp.data?.usuarios || []
      if (Array.isArray(lista)) {
        const desdeAtlas = lista.map((u, idx) => ({
          _id: (u._id || u.id || `sup_${idx}`).toString(),
          id: (u._id || u.id || `sup_${idx}`).toString(),
          documento: u.documento || u.telefono || `DOC-S${idx + 1}`,
          nombre: u.nombre_completo || u.nombre,
          correo: u.correo_institucional || u.correo,
          telefono: u.telefono || '3100000000',
          cargo: u.cargo || 'Supervisor de Contratos',
          dependencia:
            u.dependencia || u.dependencia_id?.nombre_dependencia || 'Gestión Tecnológica (TIC)',
          dependencia_id: u.dependencia_id?._id || u.dependencia_id || null,
          password: '123',
        }))

        const mapa = new Map()
        // MongoDB Atlas primero para que los nuevos queden arriba
        desdeAtlas.forEach((s) => mapa.set(s.correo.toLowerCase(), s))
        supervisoresBase.forEach((s) => {
          if (!mapa.has(s.correo.toLowerCase())) {
            mapa.set(s.correo.toLowerCase(), s)
          }
        })
        supervisores.value = Array.from(mapa.values())
      }
    } catch (err) {
      console.warn('Cargando supervisores locales:', err.message)
    } finally {
      cargando.value = false
    }
  }

  // Cargar inmediatamente
  cargarSupervisores()

  async function agregar(nuevo) {
    try {
      await api.post('/usuarios', {
        nombre: nuevo.nombre,
        nombre_completo: nuevo.nombre,
        correo: nuevo.correo,
        correo_institucional: nuevo.correo,
        documento: nuevo.documento,
        telefono: nuevo.telefono,
        cargo: nuevo.cargo || 'Supervisor de Contratos',
        dependencia: nuevo.dependencia,
        dependencia_id: nuevo.dependencia_id,
        password: nuevo.password,
        rol: 'Supervisor',
      })
      await cargarSupervisores()
    } catch (err) {
      console.error('Error al guardar supervisor en Atlas:', err)
      throw err
    }
  }

  async function editar(index, datos) {
    if (index !== -1 && index < supervisores.value.length) {
      supervisores.value[index] = { ...datos }
      try {
        const idParaApi = datos._id || datos.id
        if (idParaApi && idParaApi.length === 24) {
          await api.put(`/usuarios/${idParaApi}`, {
            nombre_completo: datos.nombre,
            telefono: datos.telefono,
            cargo: datos.cargo,
            dependencia: datos.dependencia,
            dependencia_id: datos.dependencia_id,
          })
        }
      } catch (err) {
        console.warn('Actualización de supervisor en Atlas falló, guardado local:', err.message)
      }
    }
  }

  async function eliminar(documento) {
    const sup = supervisores.value.find((item) => item.documento === documento)
    supervisores.value = supervisores.value.filter((s) => s.documento !== documento)

    try {
      const idParaBorrar = sup?._id || sup?.id || documento
      await api.delete(`/usuarios/${idParaBorrar}`)
    } catch (err) {
      console.error('Error al eliminar supervisor en Atlas:', err)
    }
  }

  return {
    supervisores,
    cargando,
    cargarSupervisores,
    agregar,
    editar,
    eliminar,
  }
})
