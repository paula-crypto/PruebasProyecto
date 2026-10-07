<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Barra superior (con print-hide para que no salga al imprimir) -->
    <q-header elevated class="bg-primary text-white print-hide">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Abrir menú"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <q-avatar class="q-ml-md">
          <img class="header-logo" src="../images/logo-sena.png" alt="Logo SENA" />
        </q-avatar>

        <q-toolbar-title>
          <div class="text-weight-bold">GCCON-F-088</div>
          <div class="text-caption">Paz y Salvo Contractual</div>
        </q-toolbar-title>

        <!-- Botón de Notificaciones -->
        <q-btn flat round icon="notifications" :to="{ name: 'notificaciones' }" class="q-mr-xs">
          <q-tooltip>Notificaciones</q-tooltip>
        </q-btn>

        <!-- Botón de Identidad de Usuario con Menú Desplegable -->
        <q-btn flat no-caps class="text-white q-ml-xs q-px-sm header-user-btn">
          <div class="row items-center no-wrap">
            <q-avatar
              size="26px"
              color="white"
              text-color="primary"
              icon="person"
              class="q-mr-sm"
            />
            <span class="text-weight-medium text-body2 q-mr-xs ellipsis" style="max-width: 190px">
              {{ textoUsuarioHeader }}
            </span>
            <q-icon name="arrow_drop_down" size="22px" />
          </div>
          <q-tooltip>Sesión iniciada: {{ rolLegible }}</q-tooltip>

          <q-menu auto-close anchor="bottom right" self="top right">
            <div class="q-pa-md bg-grey-1" style="min-width: 240px">
              <div class="row items-center q-mb-xs">
                <q-avatar
                  size="38px"
                  color="primary"
                  text-color="white"
                  icon="person"
                  class="q-mr-sm"
                />
                <div class="column">
                  <div class="text-weight-bold text-body2 text-grey-9">
                    {{ auth.usuario?.nombre || 'Usuario del Sistema' }}
                  </div>
                  <div class="text-caption text-primary text-weight-bold">
                    {{ rolLegible }}
                  </div>
                </div>
              </div>
              <div v-if="auth.usuario?.correo" class="text-caption text-grey-6 ellipsis q-mt-xs">
                {{ auth.usuario.correo }}
              </div>
            </div>

            <q-separator />

            <q-list>
              <q-item clickable :to="{ name: 'perfil' }">
                <q-item-section avatar>
                  <q-icon name="person" color="grey-8" />
                </q-item-section>
                <q-item-section>Mi Perfil</q-item-section>
              </q-item>

              <q-separator />

              <q-item clickable @click="cerrarSesion">
                <q-item-section avatar>
                  <q-icon name="logout" color="negative" />
                </q-item-section>
                <q-item-section class="text-negative text-weight-bold">
                  Cerrar Sesión
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- Menú lateral (con print-hide para que desaparezca al imprimir) -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="250"
      class="bg-grey-1 print-hide"
    >
      <q-list padding>
        <q-item-label header class="text-primary text-weight-bold"> MENÚ PRINCIPAL </q-item-label>

        <q-item
          v-for="item in menuItems"
          :key="item.name"
          clickable
          v-ripple
          :to="item.to"
          :exact="item.exact"
          active-class="text-primary text-weight-bold bg-green-1"
          @click="cerrarDrawerEnMovil"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>{{ item.label }}</q-item-section>
        </q-item>

        <q-separator class="q-my-sm" />

        <q-item
          clickable
          v-ripple
          :to="{ name: 'perfil' }"
          active-class="text-primary text-weight-bold bg-green-1"
          @click="cerrarDrawerEnMovil"
        >
          <q-item-section avatar>
            <q-icon name="person" />
          </q-item-section>
          <q-item-section>Perfil</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- Contenido -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '../stores/authStore.js'

const normalizarRol = (valor) => {
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

const $q = useQuasar()
const leftDrawerOpen = ref($q.screen.gt.sm)
const router = useRouter()
const auth = useAuthStore()

const rolLegible = computed(() => {
  const r = normalizarRol(auth.usuario?.rol || auth.rolUsuario)
  if (r === 'ADMINISTRADOR') return 'Administrador General'
  if (r === 'SUPERVISOR') return 'Supervisor'
  if (r === 'RESPONSABLE_AREA') return 'Responsable de Área'
  if (r === 'CONTRATISTA') return 'Contratista'
  return auth.usuario?.rol || 'Usuario'
})

const textoUsuarioHeader = computed(() => {
  if (!auth.usuario) return 'Usuario'
  const nom = (auth.usuario.nombre || '').trim()
  if (nom.includes('Administrador General')) {
    return 'Administrador General'
  }
  return nom || rolLegible.value
})

// Reacciona en vivo si la pantalla cambia de tamaño (p. ej. al usar
// las DevTools en modo responsivo, o al rotar/redimensionar la ventana)
watch(
  () => $q.screen.gt.sm,
  (esPantallaGrande) => {
    leftDrawerOpen.value = esPantallaGrande
  },
)

const menuBase = [
  {
    name: 'dashboard',
    label: 'Dashboard',
    to: { name: 'dashboard' },
    icon: 'dashboard',
    exact: true,
    roles: ['ADMINISTRADOR', 'SUPERVISOR', 'CONTRATISTA', 'RESPONSABLE_AREA'],
  },
  {
    name: 'usuarios',
    label: 'Usuarios',
    to: { name: 'usuarios' },
    icon: 'people',
    exact: false,
    roles: ['ADMINISTRADOR'],
  },
  {
    name: 'supervisores',
    label: 'Supervisores',
    to: { name: 'supervisores' },
    icon: 'supervisor_account',
    exact: false,
    roles: ['ADMINISTRADOR'],
  },
  {
    name: 'contratistas',
    label: 'Contratistas',
    to: { name: 'contratistas' },
    icon: 'description',
    exact: false,
    roles: ['ADMINISTRADOR', 'SUPERVISOR'],
  },
  {
    name: 'dependencias',
    label: 'Dependencias',
    to: { name: 'dependencias' },
    icon: 'business',
    exact: false,
    roles: ['ADMINISTRADOR', 'SUPERVISOR'],
  },
  {
    name: 'solicitudes',
    label: 'Solicitudes',
    to: { name: 'solicitudes' },
    icon: 'assignment',
    exact: false,
    roles: ['ADMINISTRADOR', 'SUPERVISOR', 'CONTRATISTA', 'RESPONSABLE_AREA'],
  },
  {
    name: 'firmas',
    label: 'Firmas',
    to: { name: 'firmas' },
    icon: 'draw',
    exact: false,
    roles: ['RESPONSABLE_AREA'],
  },
  {
    name: 'reportes',
    label: 'Reportes',
    to: { name: 'reportes' },
    icon: 'bar_chart',
    exact: false,
    roles: ['ADMINISTRADOR', 'SUPERVISOR'],
  },
]

const menuItems = computed(() => {
  const rolActual = normalizarRol(auth.usuario?.rol)
  if (!rolActual) return []

  return menuBase.filter((item) => item.roles.some((rol) => normalizarRol(rol) === rolActual))
})

function cerrarSesion() {
  $q.dialog({
    title: 'Cerrar sesión',
    message: '¿Está seguro que desea cerrar la sesión?',
    cancel: {
      label: 'CANCELAR',
      flat: true,
      textColor: 'primary',
      noCaps: false,
    },
    ok: {
      label: 'OK',
      unelevated: true,
      color: 'green-1',
      textColor: 'primary',
      noCaps: false,
    },
    persistent: true,
  }).onOk(() => {
    auth.logout()
    router.push('/login')
  })
}

function cerrarDrawerEnMovil() {
  if ($q.screen.lt.md) {
    leftDrawerOpen.value = false
  }
}
</script>

<style scoped>
.header-logo {
  filter: brightness(0) invert(1);
  width: 34px;
  height: auto;
}

.header-user-btn {
  border-radius: 8px;
  padding: 4px 10px;
  transition: background-color 0.2s ease;
}
.header-user-btn:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

/* Reglas definitivas para impresión y PDF */
</style>
