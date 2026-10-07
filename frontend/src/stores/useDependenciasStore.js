import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export const useDependenciasStore = defineStore('dependencias', () => {
  const dependencias = ref([])
  const cargando = ref(false)

  const dependenciasBase = [
    {
      _id: 'DEP-01',
      codigo: 'DEP-01',
      nombre: 'Gestión Tecnológica (TIC)',
      responsable: 'Ing. Roberto TIC',
      correo: 'area.tic@gccon.com',
      estado: 'Activa',
    },
    {
      _id: 'DEP-02',
      codigo: 'DEP-02',
      nombre: 'Almacén e Inventarios',
      responsable: 'Lic. Martha Almacén',
      correo: 'area.almacen@gccon.com',
      estado: 'Activa',
    },
    {
      _id: 'DEP-03',
      codigo: 'DEP-03',
      nombre: 'Recursos Humanos / Talento Humano',
      responsable: 'Dra. Claudia Ramos',
      correo: 'rrhh@sena.edu.co',
      estado: 'Activa',
    },
    {
      _id: 'DEP-04',
      codigo: 'DEP-04',
      nombre: 'Infraestructura y Servicios Generales',
      responsable: 'Ing. Fernando Ramírez',
      correo: 'infraestructura@sena.edu.co',
      estado: 'Activa',
    },
    {
      _id: 'DEP-05',
      codigo: 'DEP-05',
      nombre: 'Biblioteca y Archivo',
      responsable: 'Lic. Jorge Biblioteca',
      correo: 'biblioteca@sena.edu.co',
      estado: 'Activa',
    },
    {
      _id: 'DEP-06',
      codigo: 'DEP-06',
      nombre: 'Bienestar al Aprendiz y Comunidad',
      responsable: 'Dra. Patricia Valenzuela',
      correo: 'bienestar@sena.edu.co',
      estado: 'Activa',
    },
  ]

  dependencias.value = [...dependenciasBase]

  async function cargarDependencias() {
    cargando.value = true
    try {
      const resp = await api.get('/dependencias')
      const lista = Array.isArray(resp.data) ? resp.data : resp.data?.dependencias || []
      if (Array.isArray(lista) && lista.length > 0) {
        const desdeAtlas = lista.map((d, idx) => ({
          _id: d._id?.toString() || `dep_${idx}`,
          id: d._id?.toString() || `dep_${idx}`,
          codigo: d.codigo || `DEP-${String(idx + 1).padStart(2, '0')}`,
          nombre: d.nombre_dependencia || d.nombre || 'Área Dependencia',
          responsable: d.responsable_id?.nombre_completo || d.responsable || 'Responsable Asignado',
          responsable_id: d.responsable_id?._id || d.responsable_id?.id || d.responsable_id || null,
          correo: d.correo || d.responsable_id?.correo_institucional || 'dependencia@sena.edu.co',
          estado: d.activo === false ? 'Inactiva' : 'Activa',
        }))

        const mapa = new Map()
        desdeAtlas.forEach((d) => mapa.set(d.nombre.toLowerCase().trim(), d))
        dependenciasBase.forEach((d) => {
          if (!mapa.has(d.nombre.toLowerCase().trim())) {
            mapa.set(d.nombre.toLowerCase().trim(), d)
          }
        })
        dependencias.value = Array.from(mapa.values())
      }
    } catch (err) {
      console.warn('Cargando dependencias locales en fallback:', err.message)
    } finally {
      cargando.value = false
    }
  }

  // Cargar inmediatamente
  cargarDependencias()

  async function agregar(nuevaDependencia) {
    const itemAInsertar = {
      ...nuevaDependencia,
      _id: `dep_${Date.now()}`,
    }
    dependencias.value.unshift(itemAInsertar)

    try {
      await api.post('/dependencias', {
        nombre_dependencia: nuevaDependencia.nombre,
        codigo: nuevaDependencia.codigo,
        responsable_id: nuevaDependencia.responsable_id || null,
        correo: nuevaDependencia.correo,
        activo: nuevaDependencia.estado !== 'Inactivo' && nuevaDependencia.estado !== 'Inactiva',
      })
      await cargarDependencias()
    } catch (err) {
      console.warn('Registro de dependencia en fallback local:', err.message)
    }
  }

  async function editar(indice, datosActualizados) {
    if (indice !== -1 && indice < dependencias.value.length) {
      const actual = dependencias.value[indice]
      dependencias.value[indice] = { ...actual, ...datosActualizados }

      const idAtlas = actual?._id || actual?.id
      if (idAtlas && idAtlas.length === 24) {
        try {
          await api.put(`/dependencias/${idAtlas}`, {
            nombre_dependencia: datosActualizados.nombre,
            responsable_id: datosActualizados.responsable_id || null,
            activo:
              datosActualizados.estado !== 'Inactivo' && datosActualizados.estado !== 'Inactiva',
          })
          await cargarDependencias()
        } catch (err) {
          console.warn('Error al editar dependencia en Atlas:', err.message)
        }
      }
    }
  }

  async function eliminar(codigoOId) {
    const dep = dependencias.value.find(
      (item) => item.codigo === codigoOId || item._id === codigoOId || item.id === codigoOId,
    )
    if (dep) {
      dep.estado = dep.estado === 'Inactiva' || dep.estado === 'Inactivo' ? 'Activa' : 'Inactiva'
      const idAtlas = dep?._id || dep?.id
      if (idAtlas && idAtlas.length === 24) {
        try {
          await api.put(`/dependencias/${idAtlas}`, {
            nombre_dependencia: dep.nombre,
            activo: dep.estado === 'Activa',
          })
        } catch (err) {
          console.warn('Error al actualizar estado de dependencia en Atlas:', err.message)
        }
      }
    }
  }

  return {
    dependencias,
    cargando,
    cargarDependencias,
    agregar,
    editar,
    eliminar,
  }
})
