<template>
  <q-page class="q-pa-lg">
    <div class="row items-center justify-between q-mb-lg">
      <div class="text-h4 text-weight-bold text-grey-9">Reportes</div>
      <q-btn flat round icon="refresh" color="primary" @click="cargar" :loading="cargando">
        <q-tooltip>Actualizar reportes</q-tooltip>
      </q-btn>
    </div>

    <!-- Tarjetas de métricas -->
    <div class="row q-col-gutter-lg q-mb-xl">
      <div v-for="card in tarjetas" :key="card.titulo" class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="bg-white q-pa-md shadow-1 rounded-borders">
          <div class="text-grey-7 text-subtitle2">{{ card.titulo }}</div>
          <div class="text-h3 text-weight-bold q-mt-xs" :class="card.color || 'text-grey-9'">
            {{ card.cantidad }}
          </div>
        </q-card>
      </div>
    </div>

    <!-- Tabla: Contratos por estado -->
    <q-card flat bordered class="bg-white shadow-1 rounded-borders">
      <q-card-section class="text-h6 text-weight-bold text-grey-9">
        Contratos por estado
      </q-card-section>
      <q-separator />
      <q-card-section class="q-pa-none">
        <q-table
          :rows="rows"
          :columns="columns"
          row-key="estado"
          flat
          hide-bottom
          :loading="cargando"
          no-data-label="Sin contratos registrados en el sistema."
          :pagination="{ rowsPerPage: 0 }"
        >
          <template v-slot:body-cell-estado="props">
            <q-td :props="props">
              <span class="text-weight-medium text-grey-9">{{ props.value }}</span>
            </q-td>
          </template>
          <template v-slot:body-cell-cantidad="props">
            <q-td :props="props">
              <span class="text-weight-bold text-body1 text-grey-9">{{ props.value }}</span>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'
import { useSolicitudesStore } from '../stores/useSolicitudesStore'

const solicitudesStore = useSolicitudesStore()
const rows = ref([])
const cargando = ref(false)

const columns = [
  { name: 'estado', label: 'Estado', field: 'estado', align: 'left', sortable: true },
  { name: 'cantidad', label: 'Cantidad', field: 'cantidad', align: 'center', sortable: true },
]

const tarjetas = ref([
  { titulo: 'Total contratos', cantidad: 0, color: 'text-grey-9' },
  { titulo: 'Finalizados', cantidad: 0, color: 'text-positive' },
  { titulo: 'En proceso', cantidad: 0, color: 'text-primary' },
  { titulo: 'Rechazados', cantidad: 0, color: 'text-negative' },
])

onMounted(cargar)

async function cargar() {
  cargando.value = true
  try {
    // 1. Cargar solicitudes unificadas de Atlas y fallback
    await solicitudesStore.cargarSolicitudes()
    let lista = solicitudesStore.solicitudes || []

    try {
      const resp = await api.get('/contratos')
      const desdeApi = Array.isArray(resp.data) ? resp.data : resp.data?.contratos || []
      if (desdeApi.length > 0 && lista.length === 0) {
        lista = desdeApi
      }
    } catch {
      // Continúa con la lista del store
    }

    // 2. Conteo por estado
    const conteo = {}
    let finalizados = 0
    let enProceso = 0
    let rechazados = 0

    lista.forEach((c) => {
      let est = c.estado || 'En revisión'
      if (est === 'Finalizado' || est === 'Firmado') {
        finalizados++
        est = 'Finalizado'
      } else if (est === 'Rechazado') {
        rechazados++
        est = 'Rechazado'
      } else {
        enProceso++
        est = 'En revisión'
      }

      conteo[est] = (conteo[est] || 0) + 1
    })

    // 3. Asignar valores a las tarjetas reactivas
    tarjetas.value[0].cantidad = lista.length
    tarjetas.value[1].cantidad = finalizados
    tarjetas.value[2].cantidad = enProceso
    tarjetas.value[3].cantidad = rechazados

    // 4. Llenar tabla
    rows.value = Object.entries(conteo).map(([estado, cantidad]) => ({
      estado,
      cantidad,
    }))
  } catch (err) {
    console.error('Error cargando métricas en Reportes:', err)
  } finally {
    cargando.value = false
  }
}
</script>
