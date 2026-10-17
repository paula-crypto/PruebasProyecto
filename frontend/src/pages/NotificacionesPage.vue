<template>
  <q-page class="q-pa-lg">
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="row items-center q-gutter-x-sm">
          <div class="text-h4 text-weight-bold text-grey-9">Notificaciones del Sistema</div>
          <q-badge
            v-if="notifStore.totalNoLeidas > 0"
            color="red-7"
            class="text-body2 text-weight-bold q-px-sm q-py-xs"
            rounded
          >
            {{ notifStore.totalNoLeidas }} nuevas
          </q-badge>
        </div>
        <div class="text-subtitle1 text-grey-7 q-mt-xs">
          Trámites, firmas y novedades activas para: <strong>{{ rolLegible }}</strong>
        </div>
      </div>
      <div class="row items-center q-gutter-x-sm">
        <q-btn
          v-if="notifStore.totalNoLeidas > 0"
          flat
          dense
          color="primary"
          icon="done_all"
          label="Marcar leídas"
          @click="notifStore.marcarTodasLeidas"
          class="q-px-sm"
        >
          <q-tooltip>Marcar todas como leídas</q-tooltip>
        </q-btn>
        <q-btn
          flat
          round
          icon="refresh"
          color="primary"
          @click="notifStore.cargarNotificaciones"
          :loading="notifStore.cargando"
        >
          <q-tooltip>Actualizar notificaciones</q-tooltip>
        </q-btn>
      </div>
    </div>

    <q-card flat bordered class="bg-white q-pa-md shadow-1 rounded-borders">
      <div v-if="notifStore.cargando" class="text-center q-pa-xl">
        <q-spinner-dots color="primary" size="40px" />
        <div class="text-caption text-grey-6 q-mt-sm">Cargando eventos...</div>
      </div>

      <q-list v-else-if="notifStore.notificaciones.length" separator>
        <q-item
          v-for="n in notifStore.notificaciones"
          :key="n.id"
          clickable
          v-ripple
          @click="notifStore.marcarLeida(n.id)"
          class="q-py-md notif-item transition-all"
          :class="{ 'notif-no-leida': !n.leida }"
        >
          <!-- Indicador lateral estilo WhatsApp para no leídas -->
          <div v-if="!n.leida" class="punto-no-leido" />

          <q-item-section avatar>
            <div class="notif-icono" :style="{ background: n.bg, color: n.color }">
              <q-icon :name="n.icono" size="24px" />
            </div>
          </q-item-section>

          <q-item-section>
            <div class="row items-center q-gutter-x-sm">
              <span class="text-weight-bold text-body1 text-grey-9">{{ n.titulo }}</span>
              <q-badge v-if="n.badge" :color="n.badgeColor || 'primary'" :label="n.badge" />
              <q-badge
                v-if="!n.leida"
                color="red-1"
                text-color="negative"
                label="Nueva"
                class="text-weight-bolder"
              />
            </div>
            <q-item-label caption class="text-grey-8 q-mt-xs text-body2">
              {{ n.descripcion }}
            </q-item-label>
          </q-item-section>

          <q-item-section side top class="items-end">
            <span class="text-caption text-grey-6">{{ n.cuando }}</span>
            <q-icon
              :name="n.leida ? 'done_all' : 'mark_email_unread'"
              size="18px"
              :color="n.leida ? 'grey-5' : 'primary'"
              class="q-mt-xs"
            >
              <q-tooltip>{{ n.leida ? 'Leída' : 'No leída (clic para marcar)' }}</q-tooltip>
            </q-icon>
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
import { computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useNotificacionesStore } from '../stores/useNotificacionesStore'

const auth = useAuthStore()
const notifStore = useNotificacionesStore()

const rolLegible = computed(() => {
  const r = (auth.rolUsuario || '').toUpperCase()
  if (r === 'ADMINISTRADOR') return 'Administrador General'
  if (r === 'SUPERVISOR') return `Supervisor (${auth.usuario?.nombre || 'General'})`
  if (r === 'RESPONSABLE_AREA') return `Responsable de Área (${auth.usuario?.dependencia || 'General'})`
  if (r === 'CONTRATISTA') return `Contratista (${auth.usuario?.nombre || 'General'})`
  return 'Usuario'
})

onMounted(() => {
  notifStore.cargarNotificaciones()
})
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

.notif-item {
  position: relative;
  border-radius: 8px;
  margin-bottom: 2px;
}

.notif-no-leida {
  background: #f8fafc;
  border-left: 4px solid #2e7d32;
}

.punto-no-leido {
  position: absolute;
  left: 6px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #2e7d32;
}
</style>
