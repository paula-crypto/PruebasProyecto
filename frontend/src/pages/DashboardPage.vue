<template>
  <q-page class="q-pa-lg">
    <!-- Encabezado -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h4 text-primary text-weight-bold">👋 Bienvenido</div>
        <div class="text-h6 q-mt-xs">Sistema GCCON-F-088</div>
        <div class="text-subtitle2 text-grey-8">Paz y Salvo Contractual</div>
        <div class="text-caption text-grey-6 text-capitalize q-mt-xs">
          {{ fechaActual }}
        </div>
      </div>

      <q-btn
        color="primary"
        icon="add"
        label="Nueva Solicitud"
        unelevated
        :to="{ name: 'solicitudes' }"
      />
    </div>

    <!-- Tarjetas de Estadísticas -->
    <div class="row q-col-gutter-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <DashboardCard titulo="Usuarios" :cantidad="totalUsuarios" icono="groups" />
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <DashboardCard titulo="Contratistas" :cantidad="totalContratistas" icono="badge" />
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <DashboardCard titulo="Dependencias" :cantidad="totalDependencias" icono="business" />
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <DashboardCard titulo="Firmas Pendientes" :cantidad="totalFirmas" icono="draw" />
      </div>
    </div>

    <!-- Actividad Reciente -->
    <div class="q-mt-xl">
      <q-card flat bordered class="shadow-1">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6 text-weight-bold text-grey-9">Actividad Reciente</div>
          <q-btn flat dense color="primary" label="Ver todas" :to="{ name: 'solicitudes' }" />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div v-if="actividades.length === 0" class="text-grey text-center q-py-lg">
            <q-icon name="assignment_late" size="48px" class="q-mb-sm" />
            <div>No existen solicitudes registradas por el momento.</div>
          </div>

          <q-list v-else separator>
            <q-item v-for="item in actividades" :key="item.id">
              <q-item-section avatar>
                <q-avatar icon="description" color="primary" text-color="white" />
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-bold">{{ item.contratista }}</q-item-label>
                <q-item-label caption>{{ item.dependencia }} — {{ item.fecha }}</q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-chip
                  :color="item.estado === 'Aprobado' ? 'positive' : 'warning'"
                  text-color="white"
                  dense
                  size="sm"
                >
                  {{ item.estado }}
                </q-chip>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import DashboardCard from '../components/DashboardCard.vue'
import api from '../services/api'

// Contadores
const totalUsuarios = ref(0)
const totalContratistas = ref(0)
const totalDependencias = ref(0)
const totalFirmas = ref(0)

// Lista de actividades
const actividades = ref([])
const cargando = ref(false)

async function cargarMetricas() {
  cargando.value = true
  try {
    const [usrRes, depRes, cntRes] = await Promise.allSettled([
      api.get('/usuarios'),
      api.get('/dependencias'),
      api.get('/contratos'),
    ])

    if (usrRes.status === 'fulfilled') {
      const usuarios = Array.isArray(usrRes.value.data)
        ? usrRes.value.data
        : usrRes.value.data?.usuarios || []
      totalUsuarios.value = usuarios.length
      totalContratistas.value = usuarios.filter((u) => {
        const r = String(u.rol || '').toUpperCase()
        return r.includes('CONTRAT')
      }).length
    }

    if (depRes.status === 'fulfilled') {
      const deps = Array.isArray(depRes.value.data)
        ? depRes.value.data
        : depRes.value.data?.dependencias || []
      totalDependencias.value = deps.length
    }

    if (cntRes.status === 'fulfilled') {
      const contratos = Array.isArray(cntRes.value.data)
        ? cntRes.value.data
        : cntRes.value.data?.contratos || []
      totalFirmas.value = contratos.filter(
        (c) =>
          c.estado === 'En revisión' ||
          c.estado === 'Pendiente de Firmas' ||
          c.estado === 'EnProceso',
      ).length

      actividades.value = contratos.slice(0, 6).map((c) => {
        const estadoNorm =
          c.estado === 'Pendiente de Firmas' || c.estado === 'EnProceso'
            ? 'En revisión'
            : c.estado || 'En revisión'
        return {
          id: c._id || c.numero_contrato,
          contratista: c.nombre_contratista || 'Contratista',
          dependencia:
            c.dependencia?.nombre_dependencia ||
            (typeof c.dependencia === 'string' ? c.dependencia : 'Gestión Tecnológica'),
          fecha: c.createdAt ? new Date(c.createdAt).toLocaleDateString('es-CO') : 'Reciente',
          estado: estadoNorm,
        }
      })
    }
  } catch (err) {
    console.warn('Carga de métricas en dashboard:', err.message)
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  cargarMetricas()
})

// Formato de Fecha
const fecha = new Date()
const fechaFormateada = fecha.toLocaleDateString('es-CO', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

const fechaActual = computed(() => {
  return fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1)
})
</script>
