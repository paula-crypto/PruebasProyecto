import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export const useSolicitudesStore = defineStore('solicitudes', () => {
  const solicitudesBase = [
    {
      id: 'SOL-2026-001',
      numeroSolicitud: 'SOL-2026-001',
      documentoContratista: '1098765432',
      contratista: 'Juan Carlos Pérez Gómez',
      nombreContratista: 'Juan Carlos Pérez Gómez',
      numeroContrato: 'CNT-2025-088',
      dependencia: 'Gestión Tecnológica',
      responsable: 'Ing. Carlos Supervisor',
      fecha: '2026-08-15',
      fechaSolicitud: '2026-08-15',
      estado: 'En revisión',
      firmas: [
        {
          dependenciaCodigo: 'DEP-01',
          dependenciaNombre: 'Gestión Tecnológica',
          firmada: true,
          fechaFirma: '2026-08-16',
        },
        {
          dependenciaCodigo: 'DEP-02',
          dependenciaNombre: 'Recursos Humanos',
          firmada: false,
          fechaFirma: null,
        },
        {
          dependenciaCodigo: 'DEP-03',
          dependenciaNombre: 'Almacén e Inventarios',
          firmada: false,
          fechaFirma: null,
        },
      ],
    },
    {
      id: 'SOL-2026-002',
      numeroSolicitud: 'SOL-2026-002',
      documentoContratista: '1095432189',
      contratista: 'Laura Andrea Contratista',
      nombreContratista: 'Laura Andrea Contratista',
      numeroContrato: 'CNT-2026-014',
      dependencia: 'Almacén e Inventarios',
      responsable: 'Lic. Martha Almacén',
      fecha: '2026-09-02',
      fechaSolicitud: '2026-09-02',
      estado: 'Firmado',
      firmas: [
        {
          dependenciaCodigo: 'DEP-01',
          dependenciaNombre: 'Gestión Tecnológica',
          firmada: true,
          fechaFirma: '2026-09-03',
        },
        {
          dependenciaCodigo: 'DEP-02',
          dependenciaNombre: 'Almacén e Inventarios',
          firmada: true,
          fechaFirma: '2026-09-04',
        },
        {
          dependenciaCodigo: 'DEP-03',
          dependenciaNombre: 'Recursos Humanos',
          firmada: true,
          fechaFirma: '2026-09-04',
        },
      ],
    },
    {
      id: 'SOL-2026-003',
      numeroSolicitud: 'SOL-2026-003',
      documentoContratista: '1094321765',
      contratista: 'María Fernanda Gómez Ruiz',
      nombreContratista: 'María Fernanda Gómez Ruiz',
      numeroContrato: 'CNT-2026-029',
      dependencia: 'Recursos Humanos',
      responsable: 'Dra. Ana María Gómez',
      fecha: '2026-09-10',
      fechaSolicitud: '2026-09-10',
      estado: 'Rechazado',
      observacionRechazo: 'Presenta novedades pendientes en Biblioteca y Almacén e Inventarios.',
      novedades: [
        {
          dependencia: 'Biblioteca',
          motivo: 'Pendiente devolución de libro de cálculo integral (código BIB-2026-04).',
          responsable: 'Lic. Jorge Biblioteca',
        },
        {
          dependencia: 'Almacén e Inventarios',
          motivo: 'Pendiente reintegro de adaptador de corriente y carnet institucional.',
          responsable: 'Lic. Martha Almacén',
        },
      ],
      firmas: [
        {
          dependenciaCodigo: 'DEP-01',
          dependenciaNombre: 'Gestión Tecnológica',
          firmada: false,
          fechaFirma: null,
        },
        {
          dependenciaCodigo: 'DEP-02',
          dependenciaNombre: 'Almacén e Inventarios',
          firmada: false,
          fechaFirma: null,
        },
      ],
    },
    {
      id: 'SOL-2026-004',
      numeroSolicitud: 'SOL-2026-004',
      documentoContratista: '1097890123',
      contratista: 'Carlos Eduardo Mendoza',
      nombreContratista: 'Carlos Eduardo Mendoza',
      numeroContrato: 'CNT-2026-042',
      dependencia: 'Gestión Tecnológica',
      responsable: 'Ing. Carlos Supervisor',
      fecha: '2026-09-12',
      fechaSolicitud: '2026-09-12',
      estado: 'Finalizado',
      firmas: [
        {
          dependenciaCodigo: 'DEP-01',
          dependenciaNombre: 'Gestión Tecnológica',
          firmada: true,
          fechaFirma: '2026-09-13',
        },
        {
          dependenciaCodigo: 'DEP-02',
          dependenciaNombre: 'Almacén e Inventarios',
          firmada: true,
          fechaFirma: '2026-09-13',
        },
        {
          dependenciaCodigo: 'DEP-03',
          dependenciaNombre: 'Recursos Humanos',
          firmada: true,
          fechaFirma: '2026-09-14',
        },
      ],
    },
    {
      id: 'SOL-2026-005',
      numeroSolicitud: 'SOL-2026-005',
      documentoContratista: '1096543210',
      contratista: 'Diego Morales Castro',
      nombreContratista: 'Diego Morales Castro',
      numeroContrato: 'CNT-2026-055',
      dependencia: 'Infraestructura y Servicios Generales',
      responsable: 'Ing. Fernando Ramírez',
      fecha: '2026-09-15',
      fechaSolicitud: '2026-09-15',
      estado: 'En revisión',
      firmas: [
        {
          dependenciaCodigo: 'DEP-04',
          dependenciaNombre: 'Infraestructura y Servicios Generales',
          firmada: true,
          fechaFirma: '2026-09-16',
        },
        {
          dependenciaCodigo: 'DEP-03',
          dependenciaNombre: 'Almacén e Inventarios',
          firmada: false,
          fechaFirma: null,
        },
      ],
    },
  ]

  const solicitudes = ref([...solicitudesBase])
  const cargando = ref(false)

  async function cargarSolicitudes() {
    cargando.value = true
    try {
      const resp = await api.get('/contratos')
      const lista = Array.isArray(resp.data) ? resp.data : resp.data?.contratos || []
      if (Array.isArray(lista) && lista.length > 0) {
        const desdeAtlas = lista.map((c, idx) => {
          const num = c.numero_contrato || `CNT-${idx + 1}`
          const nom = c.nombre_contratista || c.usuario?.nombre_completo || 'Contratista'
          const dep =
            c.dependencia?.nombre_dependencia ||
            (typeof c.dependencia === 'string' ? c.dependencia : 'Gestión Tecnológica')
          const sup = c.supervisor?.nombre_completo || 'Supervisor Asignado'
          const fch = c.createdAt
            ? new Date(c.createdAt).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0]

          let est = 'En revisión'
          if (c.estado === 'Firmado' || c.estado === 'Aprobado') {
            est = 'Firmado'
          } else if (c.estado === 'Finalizado') {
            est = 'Finalizado'
          } else if (c.estado === 'Rechazado') {
            est = 'Rechazado'
          } else {
            est = 'En revisión'
          }

          let docCon =
            c.documento_contratista ||
            c.identificacion ||
            c.documentoContratista ||
            c.documento ||
            c.usuario?.documento ||
            c.usuario?.identificacion ||
            ''
          if (!docCon || docCon === '—') {
            const baseMatch = solicitudesBase.find(
              (sb) =>
                (sb.contratista || '').toLowerCase().trim() === nom.toLowerCase().trim() ||
                (sb.numeroContrato || '').toLowerCase().trim() === String(num).toLowerCase().trim(),
            )
            if (baseMatch?.documentoContratista) {
              docCon = baseMatch.documentoContratista
            }
          }

          return {
            _id: c._id,
            id: num,
            numeroSolicitud: `SOL-${String(num).replace(/\D/g, '').slice(-4).padStart(4, '0') || '00' + (idx + 1)}`,
            documentoContratista: docCon || '—',
            identificacion: docCon || '',
            contratista: nom,
            nombreContratista: nom,
            numeroContrato: num,
            dependencia: dep,
            responsable: sup,
            fecha: fch,
            fechaSolicitud: fch,
            estado: est,
            observacionRechazo:
              c.observaciones_supervisor ||
              c.observacion_rechazo ||
              localStorage.getItem(`novedad_${c._id}`) ||
              localStorage.getItem(`novedad_${num}`) ||
              '',
            bienes:
              Array.isArray(c.bienes) && c.bienes.length > 0
                ? c.bienes
                : [
                    {
                      descripcion: 'Equipo de cómputo y periféricos institucionales',
                      codigo_inventario: `INV-${String(num).replace(/\D/g, '').slice(-4).padStart(4, '0') || '1042'}`,
                      estado_bien: 'Bueno',
                      cantidad: 1,
                      estado_entrega:
                        est === 'Firmado' || est === 'Finalizado' ? 'Devuelto' : 'Pendiente',
                    },
                  ],
            firmas: [
              {
                dependenciaCodigo: 'DEP-01',
                dependenciaNombre: dep,
                firmada: est === 'Firmado' || est === 'Finalizado',
                fechaFirma: est === 'Firmado' || est === 'Finalizado' ? fch : null,
              },
            ],
          }
        })

        const mapa = new Map()
        desdeAtlas.forEach((s) => mapa.set((s.numeroContrato || s.id).toLowerCase(), s))
        // Preservar contratos en memoria sólo si no existen en Atlas
        solicitudes.value.forEach((s) => {
          const key = (s.numeroContrato || s.numeroSolicitud || s.id || '').toLowerCase()
          if (key && !mapa.has(key)) {
            mapa.set(key, s)
          }
        })
        solicitudes.value = Array.from(mapa.values())
      }
    } catch (err) {
      console.warn('Cargando solicitudes locales:', err.message)
    } finally {
      cargando.value = false
    }
  }

  cargarSolicitudes()

  async function agregarSolicitud(nuevaSolicitud) {
    const num = nuevaSolicitud.numeroContrato || `CNT-${Date.now().toString().slice(-4)}`
    const nom = nuevaSolicitud.contratista || nuevaSolicitud.nombreContratista || 'Contratista'
    const doc =
      nuevaSolicitud.identificacion ||
      nuevaSolicitud.documentoContratista ||
      nuevaSolicitud.documento ||
      ''
    const dep = nuevaSolicitud.dependencia || 'Gestión Tecnológica'
    const sup = nuevaSolicitud.responsable || 'Supervisor Asignado'
    const fch = nuevaSolicitud.fecha || new Date().toISOString().split('T')[0]
    const est = 'En revisión'

    const solicitudAInsertar = {
      ...nuevaSolicitud,
      id: nuevaSolicitud.numeroSolicitud || num,
      numeroSolicitud:
        nuevaSolicitud.numeroSolicitud ||
        `SOL-${String(num).replace(/\D/g, '').slice(-4).padStart(4, '0')}`,
      numeroContrato: num,
      contratista: nom,
      nombreContratista: nom,
      documentoContratista: doc || '—',
      identificacion: doc,
      dependencia: dep,
      responsable: sup,
      fecha: fch,
      fechaSolicitud: fch,
      estado: est,
      firmas: [
        {
          dependenciaCodigo: 'DEP-01',
          dependenciaNombre: dep,
          firmada: false,
          fechaFirma: null,
        },
      ],
    }
    solicitudes.value.unshift(solicitudAInsertar)

    try {
      await api.post('/contratos', {
        numero: num,
        contratista: nom,
        nombre_contratista: nom,
        documento_contratista: doc,
        identificacion: doc,
        documento: doc,
        telefono: nuevaSolicitud.telefono || '3001234567',
        dependencia: dep,
        estado: est,
        bienes: [
          {
            descripcion: 'Equipo de cómputo y accesorios de oficina',
            codigo_inventario: `INV-${Date.now().toString().slice(-4)}`,
            estado_bien: 'Bueno',
          },
        ],
      })
      await cargarSolicitudes()
    } catch (err) {
      console.error(
        'Error al registrar contrato en Atlas:',
        err.response?.data?.mensaje || err.message,
      )
      throw new Error(
        err.response?.data?.mensaje || err.message || 'Error al registrar contrato en Atlas',
      )
    }
  }

  async function actualizarSolicitud(idBusqueda, datosActualizados) {
    const item = solicitudes.value.find(
      (s) =>
        s._id === idBusqueda ||
        s.id === idBusqueda ||
        s.numeroSolicitud === idBusqueda ||
        s.numeroContrato === idBusqueda ||
        s.solicitud === idBusqueda,
    )
    if (item) {
      Object.assign(item, datosActualizados)
      if (datosActualizados.identificacion || datosActualizados.documentoContratista) {
        const d = datosActualizados.identificacion || datosActualizados.documentoContratista
        item.identificacion = d
        item.documentoContratista = d
      }
      const motivo =
        datosActualizados.observacionRechazo ||
        datosActualizados.observaciones_supervisor ||
        item.observacionRechazo ||
        item.observaciones_supervisor ||
        ''
      if (motivo) {
        item.observacionRechazo = motivo
        item.observaciones_supervisor = motivo
        if (item._id) localStorage.setItem(`novedad_${item._id}`, motivo)
        if (item.numeroContrato) localStorage.setItem(`novedad_${item.numeroContrato}`, motivo)
        if (item.numeroSolicitud) localStorage.setItem(`novedad_${item.numeroSolicitud}`, motivo)
      }
      const idParaApi = item._id || item.numeroContrato || item.id
      try {
        await api.put(`/contratos/${idParaApi}`, {
          numero_contrato: item.numeroContrato,
          contratista: item.contratista || item.nombreContratista,
          documento_contratista: item.identificacion || item.documentoContratista || '',
          identificacion: item.identificacion || item.documentoContratista || '',
          dependencia: item.dependencia,
          estado: item.estado,
          observaciones_supervisor: motivo,
          observacion_rechazo: motivo,
          observacionRechazo: motivo,
          motivo: motivo,
        })
      } catch (err) {
        console.warn('Sincronización con backend falló, mantenido localmente:', err.message)
      }
    }
  }

  async function cambiarEstado(idBusqueda, nuevoEstado, motivo = '') {
    const item = solicitudes.value.find(
      (s) =>
        s._id === idBusqueda ||
        s.id === idBusqueda ||
        s.numeroSolicitud === idBusqueda ||
        s.numeroContrato === idBusqueda ||
        s.solicitud === idBusqueda,
    )
    if (item) {
      item.estado = nuevoEstado
      if (
        nuevoEstado === 'Firmado' ||
        nuevoEstado === 'Aprobado' ||
        nuevoEstado === 'Paz y Salvo'
      ) {
        item.observacionRechazo = ''
        item.observaciones_supervisor = ''
        item.novedades = []
        item.bienesFaltantes = []
        if (item._id) localStorage.removeItem(`novedad_${item._id}`)
        if (item.numeroContrato) localStorage.removeItem(`novedad_${item.numeroContrato}`)
        if (item.numeroSolicitud) localStorage.removeItem(`novedad_${item.numeroSolicitud}`)
      } else if (motivo) {
        item.observacionRechazo = motivo
        item.observaciones_supervisor = motivo
        if (item._id) localStorage.setItem(`novedad_${item._id}`, motivo)
        if (item.numeroContrato) localStorage.setItem(`novedad_${item.numeroContrato}`, motivo)
        if (item.numeroSolicitud) localStorage.setItem(`novedad_${item.numeroSolicitud}`, motivo)
      }
      const idParaApi = item._id || item.numeroContrato || item.id
      try {
        await api.put(`/contratos/${idParaApi}`, {
          estado: nuevoEstado,
          observaciones_supervisor: nuevoEstado === 'Firmado' ? '' : motivo,
          observacion_rechazo: nuevoEstado === 'Firmado' ? '' : motivo,
          observacionRechazo: nuevoEstado === 'Firmado' ? '' : motivo,
          motivo: nuevoEstado === 'Firmado' ? '' : motivo,
        })
      } catch (err) {
        console.warn('Sincronización de estado falló en backend, aplicado localmente:', err.message)
      }
    }
    return item
  }

  async function eliminarSolicitud(idBusqueda) {
    // En el flujo de Solicitudes, desactivar una solicitud significa transicionar su estado a 'Rechazado'
    return await cambiarEstado(
      idBusqueda,
      'Rechazado',
      'Desactivado desde el módulo de solicitudes',
    )
  }

  function registrarFirma(idSolicitud, codigoDependencia) {
    const solicitud = solicitudes.value.find((s) => (s.id || s.numeroSolicitud) === idSolicitud)
    if (solicitud) {
      const firma = solicitud.firmas?.find((f) => f.dependenciaCodigo === codigoDependencia)
      if (firma) {
        firma.firmada = true
        firma.fechaFirma = new Date().toISOString().split('T')[0]
      }

      const todasFirmadas = solicitud.firmas?.every((f) => f.firmada)
      if (todasFirmadas) {
        solicitud.estado = 'Firmado'
        solicitud.observacionRechazo = ''
        solicitud.observaciones_supervisor = ''
        solicitud.novedades = []
        solicitud.bienesFaltantes = []
      }
    }
  }

  async function rechazarSolicitudConDictamen(idSolicitud, observacion, bienesFaltantes = []) {
    const item = solicitudes.value.find(
      (s) =>
        s._id === idSolicitud ||
        s.id === idSolicitud ||
        s.numeroSolicitud === idSolicitud ||
        s.numeroContrato === idSolicitud ||
        s.solicitud === idSolicitud,
    )
    if (item) {
      item.estado = 'Rechazado'
      item.observacionRechazo = observacion
      item.observaciones_supervisor = observacion
      item.bienesFaltantes = bienesFaltantes

      const idParaApi = item._id || item.numeroContrato || item.id
      try {
        await api.post('/firmas/procesar', {
          contratoId: idParaApi,
          accion: 'Rechazar',
          observacion_rechazo: observacion,
        })
      } catch (err) {
        console.warn('API firmas rechazo fallback:', err.message)
        try {
          await api.put(`/contratos/${idParaApi}`, {
            estado: 'Rechazado',
            observaciones_supervisor: observacion,
          })
        } catch (err2) {
          console.warn('Fallback PUT contrato falló:', err2.message)
        }
      }
    }
    return item
  }

  function rechazarSolicitud(idSolicitud, observacion) {
    const solicitud = solicitudes.value.find((s) => (s.id || s.numeroSolicitud) === idSolicitud)
    if (solicitud) {
      solicitud.estado = 'Rechazado'
      solicitud.observacionRechazo = observacion
    }
  }

  function obtenerSolicitudPorId(id) {
    return solicitudes.value.find(
      (s) => s.id === id || s.numeroSolicitud === id || s.numeroContrato === id,
    )
  }

  function obtenerPorCodigo(codigo) {
    if (!codigo) return null
    const c = String(codigo).toLowerCase()
    return solicitudes.value.find(
      (s) =>
        (s.id && String(s.id).toLowerCase() === c) ||
        (s._id && String(s._id).toLowerCase() === c) ||
        (s.numeroSolicitud && String(s.numeroSolicitud).toLowerCase() === c) ||
        (s.solicitud && String(s.solicitud).toLowerCase() === c) ||
        (s.numeroContrato && String(s.numeroContrato).toLowerCase() === c) ||
        (s.contrato && String(s.contrato).toLowerCase() === c),
    )
  }

  return {
    solicitudes,
    cargando,
    cargarSolicitudes,
    agregarSolicitud,
    actualizarSolicitud,
    cambiarEstado,
    eliminarSolicitud,
    registrarFirma,
    rechazarSolicitud,
    rechazarSolicitudConDictamen,
    obtenerSolicitudPorId,
    obtenerPorCodigo,
  }
})
