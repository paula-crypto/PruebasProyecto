import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './authStore'
import { useSolicitudesStore } from './useSolicitudesStore'
import { useContratistasStore } from './useContratistasStore'
import api from '../services/api'

function normalizarTexto(txt) {
  return String(txt || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function calcularTiempoRelativo(fecha) {
  if (!fecha) return 'reciente'
  const d = new Date(fecha)
  const dif = Date.now() - d.getTime()
  if (Number.isNaN(dif)) return 'reciente'
  const min = Math.floor(dif / 60000)
  if (min < 1) return 'hace un momento'
  if (min < 60) return `hace ${min} min`
  const hrs = Math.floor(min / 60)
  if (hrs < 24) return `hace ${hrs} h`
  const dias = Math.floor(hrs / 24)
  if (dias === 1) return 'ayer'
  if (dias < 7) return `hace ${dias} días`
  return d.toLocaleDateString('es-CO')
}

export const useNotificacionesStore = defineStore('notificaciones', () => {
  const notificaciones = ref([])
  const cargando = ref(false)
  const leidasSet = ref(new Set())

  const auth = useAuthStore()
  const solicitudesStore = useSolicitudesStore()
  const contratistasStore = useContratistasStore()

  function cargarLeidasDeStorage() {
    try {
      const uId = auth.usuario?.id || auth.usuario?._id || auth.usuario?.correo || 'default'
      const guardadas = JSON.parse(localStorage.getItem(`notifs_leidas_${uId}`) || '[]')
      leidasSet.value = new Set(guardadas)
    } catch {
      leidasSet.value = new Set()
    }
  }

  function guardarLeidasEnStorage() {
    try {
      const uId = auth.usuario?.id || auth.usuario?._id || auth.usuario?.correo || 'default'
      localStorage.setItem(`notifs_leidas_${uId}`, JSON.stringify([...leidasSet.value]))
    } catch {
      /* noop */
    }
  }

  const totalNoLeidas = computed(() => {
    return notificaciones.value.filter((n) => !n.leida).length
  })

  async function cargarNotificaciones() {
    cargando.value = true
    cargarLeidasDeStorage()

    try {
      if (solicitudesStore.cargarSolicitudes && (!solicitudesStore.solicitudes || solicitudesStore.solicitudes.length === 0)) {
        await solicitudesStore.cargarSolicitudes()
      }
      if (contratistasStore.cargarContratistas && (!contratistasStore.contratistas || contratistasStore.contratistas.length === 0)) {
        await contratistasStore.cargarContratistas()
      }

      const solicitudes = solicitudesStore.solicitudes || []
      const rol = (auth.rolUsuario || '').toUpperCase()
      const u = auth.usuario || {}
      const lista = []

      const miNombre = normalizarTexto(u.nombre || u.nombre_completo)
      const miDocumento = String(u.documento || u.identificacion || '').trim()
      const miCorreo = normalizarTexto(u.correo || u.correo_institucional)
      const miId = String(u.id || u._id || '').trim()
      const miDep = normalizarTexto(u.dependencia)

      // 1. Filtrar solicitudes según el rol exacto
      let solicitudesDelUsuario = []

      if (rol === 'CONTRATISTA') {
        solicitudesDelUsuario = solicitudes.filter((s) => {
          const doc = String(s.documentoContratista || s.identificacion || s.documento || '').trim()
          const nom = normalizarTexto(s.contratista || s.nombreContratista || s.nombre_contratista)
          const cor = normalizarTexto(s.correo || s.correoContratista)
          const conId = String(s.contratista_id || s.usuario_id || s.usuario?._id || s.usuario || s.creadoPorUsuario || '').trim()

          if (miDocumento && doc && miDocumento === doc) return true
          if (miId && conId && miId === conId) return true
          if (miCorreo && cor && miCorreo === cor) return true
          if (miNombre && nom && (nom.includes(miNombre) || miNombre.includes(nom))) return true
          return false
        })
      } else if (rol === 'SUPERVISOR') {
        solicitudesDelUsuario = solicitudes.filter((s) => {
          const resp = normalizarTexto(s.responsable || s.supervisor)
          const supId = String(s.supervisor_id || s.supervisor?._id || '').trim()
          const cor = normalizarTexto(s.correoSupervisor || s.correo_supervisor)

          if (miNombre && resp && (resp.includes(miNombre) || miNombre.includes(resp))) return true
          if (miCorreo && cor && miCorreo === cor) return true
          if (miId && supId && miId === supId) return true

          // Coincidencia con contratistas bajo su supervisión
          const nomCont = normalizarTexto(s.contratista || s.nombreContratista || s.nombre_contratista)
          const matchCont = (contratistasStore.contratistas || []).find((c) => {
            const nc = normalizarTexto(c.nombre)
            return nc && (nc.includes(nomCont) || nomCont.includes(nc))
          })
          if (matchCont?.supervisor) {
            const supDeCont = normalizarTexto(matchCont.supervisor)
            if (miNombre && supDeCont && (supDeCont.includes(miNombre) || miNombre.includes(supDeCont))) {
              return true
            }
          }
          return false
        })
      } else if (rol === 'RESPONSABLE_AREA') {
        solicitudesDelUsuario = solicitudes.filter((s) => {
          const dep = normalizarTexto(s.dependencia)
          if (miDep && dep && (dep.includes(miDep) || miDep.includes(dep))) return true
          if (Array.isArray(s.firmas)) {
            return s.firmas.some((f) => {
              const nomF = normalizarTexto(f.dependenciaNombre || f.dependencia)
              return miDep && nomF && (nomF.includes(miDep) || miDep.includes(nomF))
            })
          }
          return true
        })
      } else {
        // ADMINISTRADOR ve todas
        solicitudesDelUsuario = solicitudes
      }

      // 2. Construir notificaciones enriquecidas por cada solicitud
      solicitudesDelUsuario.forEach((s) => {
        const num = s.numeroContrato || s.contrato || s.numeroSolicitud || s.id || 'N/A'
        const rad = s.numeroSolicitud || s.solicitud || num
        const contratista = s.nombreContratista || s.contratista || 'Contratista'
        const fecha = s.updatedAt || s.createdAt || s.fecha || new Date().toISOString()
        const estado = s.estado || 'En revisión'

        // Identificador único para el tracking de WhatsApp
        const notifId = `${s._id || num}_${estado}_${s.observacionRechazo ? 'rech' : 'ok'}`

        if (estado === 'Rechazado') {
          const motivo = s.observacionRechazo || s.observaciones_supervisor || 'Presenta novedades o bienes pendientes de devolución'
          lista.push({
            id: notifId,
            icono: 'report_problem',
            bg: '#ffebee',
            color: '#c62828',
            badge: 'Novedad / Rechazado',
            badgeColor: 'negative',
            titulo: rol === 'CONTRATISTA' ? 'Novedad pendiente por subsanar' : `Novedad en contrato ${num}`,
            descripcion:
              rol === 'CONTRATISTA'
                ? `Tu trámite ${rad} tiene novedades pendientes de entrega: "${motivo}".`
                : `El contrato ${num} de ${contratista} tiene observaciones pendientes: "${motivo}".`,
            cuando: calcularTiempoRelativo(fecha),
            timestamp: new Date(fecha).getTime() || 0,
            solicitud: s,
            leida: leidasSet.value.has(notifId),
          })
        } else if (estado === 'Finalizado') {
          lista.push({
            id: notifId,
            icono: 'verified',
            bg: '#e8f5e9',
            color: '#2e7d32',
            badge: 'Listo para PDF',
            badgeColor: 'teal',
            titulo: 'Paz y Salvo 100% Finalizado',
            descripcion:
              rol === 'CONTRATISTA'
                ? `¡Felicitaciones! Tu paz y salvo para el contrato ${num} completó todas las firmas institucionales y el Vo.Bo. del supervisor. Ya puedes descargar tu PDF.`
                : `El contrato ${num} de ${contratista} completó el ciclo y fue finalizado exitosamente.`,
            cuando: calcularTiempoRelativo(fecha),
            timestamp: new Date(fecha).getTime() || 0,
            solicitud: s,
            leida: leidasSet.value.has(notifId),
          })
        } else if (estado === 'Firmado') {
          lista.push({
            id: notifId,
            icono: 'draw',
            bg: '#e0f2f1',
            color: '#00695c',
            badge: rol === 'SUPERVISOR' ? 'Listo para Firma Final' : 'Firmado',
            badgeColor: 'teal-8',
            titulo:
              rol === 'SUPERVISOR'
                ? 'Listo para tu Firma Final (Fila 14)'
                : 'Firma de dependencias registrada',
            descripcion:
              rol === 'SUPERVISOR'
                ? `El contrato ${num} de ${contratista} ya fue avalado por las dependencias. Puedes ingresar a la Fila 14 para colocar tu firma de cierre.`
                : `Se han registrado las firmas correspondientes en el contrato ${num} (${contratista}).`,
            cuando: calcularTiempoRelativo(fecha),
            timestamp: new Date(fecha).getTime() || 0,
            solicitud: s,
            leida: leidasSet.value.has(notifId),
          })
        } else {
          // 'En revisión' o 'Pendiente'
          lista.push({
            id: notifId,
            icono: 'hourglass_top',
            bg: '#e3f2fd',
            color: '#1565c0',
            badge: 'En revisión',
            badgeColor: 'primary',
            titulo:
              rol === 'CONTRATISTA'
                ? 'Solicitud en trámite de revisión'
                : rol === 'RESPONSABLE_AREA'
                  ? 'Firma de área requerida'
                  : 'Solicitud radicada por contratista',
            descripcion:
              rol === 'CONTRATISTA'
                ? `Tu solicitud ${rad} (${num}) se encuentra en revisión de paz y salvo por las dependencias.`
                : rol === 'RESPONSABLE_AREA'
                  ? `El contrato ${num} de ${contratista} requiere la validación de bienes y firma de tu área.`
                  : `El contratista ${contratista} radicó el contrato ${num} para su liquidación.`,
            cuando: calcularTiempoRelativo(fecha),
            timestamp: new Date(fecha).getTime() || 0,
            solicitud: s,
            leida: leidasSet.value.has(notifId),
          })
        }
      })

      // 3. Si es Administrador, agregar alertas de usuarios del sistema
      if (rol === 'ADMINISTRADOR') {
        try {
          const respU = await api.get('/usuarios')
          const usuarios = Array.isArray(respU.data) ? respU.data : respU.data?.usuarios || []
          usuarios.slice(0, 5).forEach((usr) => {
            const uNotifId = `usr_${usr._id || usr.correo}`
            lista.push({
              id: uNotifId,
              icono: 'person_add',
              bg: '#ede7f6',
              color: '#512da8',
              badge: usr.rol || 'Usuario',
              badgeColor: 'deep-purple-7',
              titulo: 'Usuario registrado',
              descripcion: `Cuenta activa de ${usr.nombre_completo || usr.nombre} (${usr.rol || 'Usuario'}).`,
              cuando: calcularTiempoRelativo(usr.createdAt),
              timestamp: new Date(usr.createdAt || 0).getTime(),
              leida: leidasSet.value.has(uNotifId),
            })
          })
        } catch {
          /* noop */
        }
      }

      // Ordenar: primero no leídas, luego por fecha más reciente
      lista.sort((a, b) => {
        if (!a.leida && b.leida) return -1
        if (a.leida && !b.leida) return 1
        return (b.timestamp || 0) - (a.timestamp || 0)
      })

      notificaciones.value = lista
    } catch (err) {
      console.error('Error cargando notificaciones:', err)
    } finally {
      cargando.value = false
    }
  }

  function marcarLeida(id) {
    if (!id) return
    leidasSet.value.add(id)
    guardarLeidasEnStorage()
    const item = notificaciones.value.find((n) => n.id === id)
    if (item) item.leida = true
  }

  function marcarTodasLeidas() {
    notificaciones.value.forEach((n) => {
      leidasSet.value.add(n.id)
      n.leida = true
    })
    guardarLeidasEnStorage()
  }

  return {
    notificaciones,
    cargando,
    totalNoLeidas,
    cargarNotificaciones,
    marcarLeida,
    marcarTodasLeidas,
  }
})
