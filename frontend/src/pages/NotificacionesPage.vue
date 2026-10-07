<template>
  <q-page class="q-pa-lg">
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold text-grey-9">Notificaciones del Sistema</div>
        <div class="text-subtitle1 text-grey-7">
          Eventos automáticos de radicación, revisiones, firmas y finalización de trámites
        </div>
      </div>
      <q-btn flat round icon="refresh" color="primary" @click="cargar" :loading="cargando">
        <q-tooltip>Actualizar notificaciones</q-tooltip>
      </q-btn>
    </div>

    <q-card flat bordered class="bg-white q-pa-md shadow-1 rounded-borders">
      <div v-if="cargando" class="text-center q-pa-xl">
        <q-spinner-dots color="primary" size="40px" />
        <div class="text-caption text-grey-6 q-mt-sm">Cargando eventos...</div>
      </div>

      <q-list v-else-if="items.length" separator>
        <q-item v-for="(n, i) in items" :key="i" class="q-py-md">
          <q-item-section avatar>
            <div class="notif-icono" :style="{ background: n.bg, color: n.color }">
              <q-icon :name="n.icono" size="24px" />
            </div>
          </q-item-section>
          <q-item-section>
            <div class="row items-center q-gutter-x-sm">
              <span class="text-weight-bold text-body1 text-grey-9">{{ n.titulo }}</span>
              <q-badge v-if="n.badge" :color="n.badgeColor || 'primary'" :label="n.badge" />
            </div>
            <q-item-label caption class="text-grey-8 q-mt-xs">{{ n.descripcion }}</q-item-label>
          </q-item-section>
          <q-item-section side top>
            <span class="text-caption text-grey-6">{{ n.cuando }}</span>
          </q-item-section>
        </q-item>
      </q-list>

      <div v-else class="text-grey-6 q-pa-xl text-center">
        <q-icon name="notifications_off" size="48px" color="grey-4" class="q-mb-sm" />
        <div class="text-body1 text-weight-medium">No hay notificaciones en este momento</div>
        <div class="text-caption text-grey-5">
          Los eventos generados por tus trámites aparecerán aquí automáticamente.
        </div>
      </div>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { useSolicitudesStore } from '../stores/useSolicitudesStore'

const auth = useAuthStore()
const solicitudesStore = useSolicitudesStore()
const items = ref([])
const cargando = ref(false)

onMounted(cargar)

async function cargar() {
  cargando.value = true
  const rol = auth.rolUsuario // 'ADMINISTRADOR', 'SUPERVISOR', 'RESPONSABLE_AREA', 'CONTRATISTA'
  const lista = []

  try {
    // 1. Obtener solicitudes del store / backend
    await solicitudesStore.cargarSolicitudes()
    const solicitudes = solicitudesStore.solicitudes || []

    // 2. Si es Administrador o Supervisor, consultar usuarios registrados
    let usuarios = []
    if (rol === 'ADMINISTRADOR' || rol === 'SUPERVISOR') {
      try {
        const respU = await api.get('/usuarios')
        usuarios = Array.isArray(respU.data) ? respU.data : respU.data?.usuarios || []
      } catch {
        usuarios = []
      }
    }

    // 3. Generar notificaciones según el rol y los estados de cada trámite
    solicitudes.forEach((c) => {
      const num = c.numeroContrato || c.numeroSolicitud || c.id
      const contratista = c.nombreContratista || c.contratista || 'Contratista'
      const fecha = c.fecha || c.fechaSolicitud || c.updatedAt || c.createdAt

      if (c.estado === 'En revisión' || c.estado === 'En revision') {
        if (rol === 'CONTRATISTA') {
          lista.push({
            icono: 'hourglass_top',
            bg: '#e3f2fd',
            color: '#1565c0',
            badge: 'En revisión',
            badgeColor: 'blue-8',
            titulo: 'Solicitud en revisión',
            descripcion: `Tu solicitud ${num} fue recibida por el sistema y se encuentra en revisión de paz y salvo.`,
            cuando: hace(fecha),
          })
        } else if (rol === 'RESPONSABLE_AREA') {
          lista.push({
            icono: 'hourglass_top',
            bg: '#e3f2fd',
            color: '#1565c0',
            badge: 'En revisión',
            badgeColor: 'blue-8',
            titulo: 'Solicitud en revisión',
            descripcion: `El contrato ${num} (${contratista}) se encuentra en revisión de paz y salvo para tu área.`,
            cuando: hace(fecha),
          })
        } else {
          // Administrador / Supervisor
          lista.push({
            icono: 'hourglass_top',
            bg: '#e3f2fd',
            color: '#1565c0',
            badge: 'En revisión',
            badgeColor: 'blue-8',
            titulo: 'Solicitud en revisión',
            descripcion: `Solicitud ${num} de ${contratista} en trámite de revisión.`,
            cuando: hace(fecha),
          })
        }
      }

      if (c.estado === 'Firmado') {
        lista.push({
          icono: 'draw',
          bg: '#e8f5e9',
          color: '#2e7d32',
          badge: 'Firmado',
          badgeColor: 'green-8',
          titulo: 'Firma de paz y salvo estampada',
          descripcion: `La solicitud ${num} (${contratista}) cuenta con firmas registradas en su formato.`,
          cuando: hace(fecha),
        })
      }

      if (c.estado === 'Finalizado') {
        lista.push({
          icono: 'verified',
          bg: '#e8f5e9',
          color: '#2e7d32',
          badge: 'Completado',
          badgeColor: 'positive',
          titulo: 'Paz y Salvo finalizado',
          descripcion: `El contrato ${num} de ${contratista} completó todas las validaciones. El certificado oficial GCCON-F-088 está listo para descarga.`,
          cuando: hace(fecha),
        })
      }

      if (c.estado === 'Rechazado') {
        lista.push({
          icono: 'report_problem',
          bg: '#ffebee',
          color: '#c62828',
          badge: 'Observación',
          badgeColor: 'negative',
          titulo: 'Observación registrada en trámite',
          descripcion: `Se registraron observaciones de no paz y salvo en el contrato ${num}. Requiere subsanar pendientes.`,
          cuando: hace(fecha),
        })
      }
    })

    // 4. Si es Administrador o Supervisor, añadir alertas de nuevos usuarios
    usuarios.forEach((u) => {
      lista.push({
        icono: 'person_add',
        bg: '#ede7f6',
        color: '#512da8',
        badge: u.rol,
        badgeColor: 'deep-purple-7',
        titulo: 'Nuevo usuario registrado',
        descripcion: `Se habilitó la cuenta de ${u.nombre_completo || u.nombre || u.correo_institucional} con rol ${u.rol}.`,
        cuando: hace(u.createdAt),
      })
    })

    items.value = lista.slice(0, 20)
  } catch (err) {
    console.error('Error cargando notificaciones:', err)
  } finally {
    cargando.value = false
  }
}

function hace(fecha) {
  if (!fecha) return 'reciente'
  const d = new Date(fecha)
  const dif = Date.now() - d.getTime()
  if (Number.isNaN(dif)) return 'reciente'
  const min = Math.floor(dif / 60000)
  if (min < 1) return 'hace un momento'
  if (min < 60) return `hace ${min} min`
  const hrs = Math.floor(min / 60)
  if (hrs < 24) return `hace ${hrs} h`
  return new Date(fecha).toLocaleDateString('es-CO')
}
</script>

<style scoped>
.notif-icono {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
