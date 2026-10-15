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
          const nom =
            c.contratista ||
            c.nombre_contratista ||
            c.nombreContratista ||
            c.usuario?.nombre_completo ||
            c.usuario?.nombre ||
            'Contratista'
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
            localStorage.getItem(`certificado_identificacion_${num}`) ||
            localStorage.getItem(`certificado_identificacion_${String(num).toLowerCase().trim()}`) ||
            (nom ? localStorage.getItem(`certificado_identificacion_${nom.toLowerCase().trim()}`) : '') ||
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
          if (docCon && docCon !== '—') {
            localStorage.setItem(`certificado_identificacion_${num}`, docCon)
            if (nom) localStorage.setItem(`certificado_identificacion_${nom.toLowerCase().trim()}`, docCon)
          }

          return {
            _id: c._id,
            id: num,
            numeroSolicitud: `SOL-${String(num).replace(/\D/g, '').slice(-4).padStart(4, '0') || '00' + (idx + 1)}`,
            documentoContratista: docCon || '—',
            identificacion: docCon || '',
            contratista: nom,
            nombreContratista: nom,
            nombre_contratista: nom,
            numeroContrato: num,
            contrato: num,
            dependencia: dep,
            responsable: sup,
            fecha: fch,
            fechaSolicitud: fch,
            estado: est,
            creadoPorUsuario: c.usuario?._id || c.usuario || null,
            creadoEnSesion: true,
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
            ciudad: c.ciudad || 'San Gil',
            regional: c.regional || 'Santander',
            direccion: c.direccion || dep,
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

        const mapaPorId = new Map()
        const mapaPorContrato = new Map()
        const mapaPorSolicitud = new Map()

        desdeAtlas.forEach((s) => {
          if (s._id) mapaPorId.set(String(s._id).toLowerCase(), s)
          if (s.numeroContrato) mapaPorContrato.set(String(s.numeroContrato).toLowerCase().trim(), s)
          if (s.numeroSolicitud) mapaPorSolicitud.set(String(s.numeroSolicitud).toLowerCase().trim(), s)
        })

        // Sincronizar elementos que estuvieran en memoria para no duplicar jamás
        solicitudes.value.forEach((s) => {
          const idKey = s._id ? String(s._id).toLowerCase() : null
          const solKey = s.numeroSolicitud ? String(s.numeroSolicitud).toLowerCase().trim() : null
          const numKey = s.numeroContrato ? String(s.numeroContrato).toLowerCase().trim() : null

          let existente = null
          if (idKey && mapaPorId.has(idKey)) existente = mapaPorId.get(idKey)
          else if (solKey && mapaPorSolicitud.has(solKey)) existente = mapaPorSolicitud.get(solKey)
          else if (numKey && mapaPorContrato.has(numKey)) existente = mapaPorContrato.get(numKey)

          if (existente) {
            // No duplicar: transferir cambios editados localmente al objeto canónico
            if (s.ciudad && s.ciudad !== 'Ibagué') existente.ciudad = s.ciudad
            if (s.direccion) existente.direccion = s.direccion
            if (s.regional && s.regional !== 'Tolima') existente.regional = s.regional
            if (s.identificacion && s.identificacion !== '—') existente.identificacion = s.identificacion
          }
        })

        // La lista canónica sin duplicados: primero Atlas, luego solo locales no colisionantes
        const clavesRegistradas = new Set()
        const listaUnica = []

        for (const s of desdeAtlas) {
          const sol = String(s.numeroSolicitud || '').toLowerCase().trim()
          const num = String(s.numeroContrato || '').toLowerCase().trim()
          const id = String(s._id || '').toLowerCase().trim()
          if (!clavesRegistradas.has(sol) && !clavesRegistradas.has(id)) {
            if (sol) clavesRegistradas.add(sol)
            if (id) clavesRegistradas.add(id)
            if (num) clavesRegistradas.add(num)
            listaUnica.push(s)
          }
        }

        for (const s of solicitudes.value) {
          const sol = String(s.numeroSolicitud || '').toLowerCase().trim()
          const num = String(s.numeroContrato || '').toLowerCase().trim()
          const id = String(s._id || '').toLowerCase().trim()
          if (!clavesRegistradas.has(sol) && (!id || !clavesRegistradas.has(id)) && (!num || !clavesRegistradas.has(num))) {
            if (sol) clavesRegistradas.add(sol)
            if (id) clavesRegistradas.add(id)
            if (num) clavesRegistradas.add(num)
            listaUnica.push(s)
          }
        }

        solicitudes.value = listaUnica
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

    if (doc) {
      localStorage.setItem(`certificado_identificacion_${num}`, doc)
      localStorage.setItem(`certificado_identificacion_${String(num).toLowerCase().trim()}`, doc)
      if (nom) localStorage.setItem(`certificado_identificacion_${nom.toLowerCase().trim()}`, doc)
      localStorage.setItem(`certificado_identificacion_${doc}`, doc)
    }

    try {
      const creadas = JSON.parse(sessionStorage.getItem('solicitudes_creadas_sesion') || '[]')
      creadas.push(num)
      creadas.push(String(num).toLowerCase().trim())
      if (nom) creadas.push(String(nom).toLowerCase().trim())
      if (doc) creadas.push(String(doc).toLowerCase().trim())
      sessionStorage.setItem('solicitudes_creadas_sesion', JSON.stringify(creadas))
    } catch {
      /* noop */
    }

    const solicitudAInsertar = {
      ...nuevaSolicitud,
      id: nuevaSolicitud.numeroSolicitud || num,
      numeroSolicitud:
        nuevaSolicitud.numeroSolicitud ||
        `SOL-${String(num).replace(/\D/g, '').slice(-4).padStart(4, '0')}`,
      numeroContrato: num,
      contrato: num,
      contratista: nom,
      nombreContratista: nom,
      nombre_contratista: nom,
      documentoContratista: doc || '—',
      identificacion: doc,
      dependencia: dep,
      responsable: sup,
      fecha: fch,
      fechaSolicitud: fch,
      estado: est,
      creadoEnSesion: true,
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
          ciudad: item.ciudad || datosActualizados.ciudad,
          regional: item.regional || datosActualizados.regional,
          direccion: item.direccion || datosActualizados.direccion,
          observaciones_supervisor: motivo,
          observacion_rechazo: motivo,
          observacionRechazo: motivo,
          motivo: motivo,
        })
        await cargarSolicitudes()
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
