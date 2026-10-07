<template>
  <q-page class="q-pa-lg">
    <!-- Encabezado -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h4 text-primary text-weight-bold">Auditoría del Sistema</div>
        <div class="text-subtitle1 text-grey-7">
          Trazabilidad y registro de eventos del formato institucional GCCON-F-088 (RNF-003)
        </div>
      </div>
      <q-btn
        color="primary"
        icon="refresh"
        label="Actualizar"
        outline
        :loading="cargando"
        @click="cargarAuditoria"
      />
    </div>

    <!-- Filtros de búsqueda -->
    <q-card flat bordered class="q-pa-md q-mb-md bg-white shadow-1">
      <div class="row q-col-gutter-md items-center">
        <div class="col-12 col-md-6">
          <q-input
            v-model="filtroTexto"
            outlined
            dense
            clearable
            placeholder="Buscar por usuario, correo, acción o entidad..."
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
        <div class="col-12 col-md-4">
          <q-select
            v-model="filtroAccion"
            outlined
            dense
            :options="opcionesAcciones"
            label="Filtrar por Acción"
            emit-value
            map-options
          />
        </div>
        <div class="col-12 col-md-2 text-right">
          <div class="text-caption text-grey-7">
            Total registros: <strong>{{ registrosFiltrados.length }}</strong>
          </div>
        </div>
      </div>
    </q-card>

    <!-- Tabla de Trazabilidad -->
    <q-card flat bordered class="bg-white shadow-1">
      <q-table
        :rows="registrosFiltrados"
        :columns="columnas"
        row-key="_id"
        :loading="cargando"
        flat
        :pagination="{ rowsPerPage: 15 }"
        no-data-label="No hay registros de auditoría que coincidan con la búsqueda."
      >
        <!-- Celda Fecha -->
        <template #body-cell-fecha="props">
          <q-td :props="props">
            <div class="text-weight-bold text-grey-9">{{ formatearFecha(props.row.createdAt) }}</div>
            <div class="text-caption text-grey-6">{{ formatearHora(props.row.createdAt) }}</div>
          </q-td>
        </template>

        <!-- Celda Usuario -->
        <template #body-cell-usuario="props">
          <q-td :props="props">
            <div class="row items-center no-wrap">
              <q-avatar size="30px" color="primary" text-color="white" class="q-mr-sm">
                {{ obtenerIniciales(props.row.usuario_id?.nombre_completo || 'Sistema') }}
              </q-avatar>
              <div>
                <div class="text-weight-medium text-grey-9">
                  {{ props.row.usuario_id?.nombre_completo || 'Sistema / Proceso' }}
                </div>
                <div class="text-caption text-grey-6">
                  {{ props.row.usuario_id?.correo_institucional || 'N/A' }}
                </div>
              </div>
            </div>
          </q-td>
        </template>

        <!-- Celda Rol -->
        <template #body-cell-rol="props">
          <q-td :props="props">
            <q-badge :color="obtenerColorRol(props.row.usuario_id?.rol)" text-color="white">
              {{ props.row.usuario_id?.rol || 'Sistema' }}
            </q-badge>
          </q-td>
        </template>

        <!-- Celda Acción -->
        <template #body-cell-accion="props">
          <q-td :props="props">
            <q-badge
              :color="obtenerColorAccion(props.value)"
              text-color="white"
              class="q-px-sm q-py-xs text-weight-bold"
            >
              {{ props.value }}
            </q-badge>
          </q-td>
        </template>

        <!-- Celda Entidad -->
        <template #body-cell-entidad="props">
          <q-td :props="props">
            <code class="text-caption bg-grey-2 q-pa-xs rounded-borders">
              {{ props.value }}
            </code>
          </q-td>
        </template>

        <!-- Celda Detalles -->
        <template #body-cell-detalles="props">
          <q-td :props="props">
            <q-btn
              flat
              dense
              round
              color="primary"
              icon="info"
              @click="mostrarDetalle(props.row)"
            >
              <q-tooltip>Ver datos del evento</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Modal para ver detalles técnicos del evento -->
    <q-dialog v-model="modalDetalle">
      <q-card style="min-width: 500px; max-width: 800px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-primary">Detalle del Registro de Auditoría</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div v-if="eventoSeleccionado" class="q-gutter-sm">
            <div class="row">
              <div class="col-4 text-weight-bold text-grey-8">Acción:</div>
              <div class="col-8">
                <q-badge :color="obtenerColorAccion(eventoSeleccionado.accion)">
                  {{ eventoSeleccionado.accion }}
                </q-badge>
              </div>
            </div>
            <div class="row">
              <div class="col-4 text-weight-bold text-grey-8">Entidad afectada:</div>
              <div class="col-8">{{ eventoSeleccionado.entidad_afectada }}</div>
            </div>
            <div class="row">
              <div class="col-4 text-weight-bold text-grey-8">Usuario:</div>
              <div class="col-8">
                {{ eventoSeleccionado.usuario_id?.nombre_completo || 'Sistema' }} ({{
                  eventoSeleccionado.usuario_id?.correo_institucional || 'N/A'
                }})
              </div>
            </div>
            <div class="row">
              <div class="col-4 text-weight-bold text-grey-8">Fecha y hora:</div>
              <div class="col-8">
                {{ formatearFecha(eventoSeleccionado.createdAt) }} -
                {{ formatearHora(eventoSeleccionado.createdAt) }}
              </div>
            </div>
            <q-separator class="q-my-sm" />
            <div class="text-weight-bold text-grey-8 q-mb-xs">Datos adicionales (JSON):</div>
            <pre class="bg-grey-9 text-white q-pa-md rounded-borders" style="max-height: 250px; overflow: auto">{{
              JSON.stringify(eventoSeleccionado.detalles || {}, null, 2)
            }}</pre>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../services/api'

const cargando = ref(false)
const auditoria = ref([])
const filtroTexto = ref('')
const filtroAccion = ref('TODAS')
const modalDetalle = ref(false)
const eventoSeleccionado = ref(null)

const opcionesAcciones = [
  { label: 'Todas las acciones', value: 'TODAS' },
  { label: 'Crear Contrato', value: 'CREAR_CONTRATO' },
  { label: 'Aprobar Contrato', value: 'APROBAR_CONTRATO' },
  { label: 'Rechazar Contrato', value: 'RECHAZAR_CONTRATO' },
  { label: 'Aprobar Firma', value: 'APROBAR_FIRMA' },
  { label: 'Rechazar Firma', value: 'RECHAZAR_FIRMA' },
  { label: 'Finalizar Contrato', value: 'FINALIZAR_CONTRATO' },
  { label: 'Actualizar Formato', value: 'ACTUALIZAR_FORMATO' },
]

const columnas = [
  { name: 'fecha', label: 'Fecha y Hora', field: 'createdAt', align: 'left', sortable: true },
  { name: 'usuario', label: 'Usuario', align: 'left' },
  { name: 'rol', label: 'Rol', align: 'center' },
  { name: 'accion', label: 'Acción Realizada', field: 'accion', align: 'center', sortable: true },
  { name: 'entidad', label: 'Entidad Afectada', field: 'entidad_afectada', align: 'left' },
  { name: 'detalles', label: 'Detalles', align: 'center' },
]

async function cargarAuditoria() {
  cargando.value = true
  try {
    const res = await api.get('/auditoria')
    auditoria.value = Array.isArray(res.data) ? res.data : []
  } catch (err) {
    console.error('Error al cargar auditoría:', err)
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  cargarAuditoria()
})

const registrosFiltrados = computed(() => {
  return auditoria.value.filter((reg) => {
    // Filtro por acción
    if (filtroAccion.value !== 'TODAS' && reg.accion !== filtroAccion.value) {
      return false
    }

    // Filtro por texto
    if (!filtroTexto.value.trim()) return true
    const term = filtroTexto.value.toLowerCase().trim()
    const usuarioNombre = (reg.usuario_id?.nombre_completo || '').toLowerCase()
    const usuarioCorreo = (reg.usuario_id?.correo_institucional || '').toLowerCase()
    const accion = (reg.accion || '').toLowerCase()
    const entidad = (reg.entidad_afectada || '').toLowerCase()

    return (
      usuarioNombre.includes(term) ||
      usuarioCorreo.includes(term) ||
      accion.includes(term) ||
      entidad.includes(term)
    )
  })
})

function formatearFecha(fechaIso) {
  if (!fechaIso) return '—'
  const d = new Date(fechaIso)
  return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatearHora(fechaIso) {
  if (!fechaIso) return '—'
  const d = new Date(fechaIso)
  return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function obtenerIniciales(nombre) {
  if (!nombre) return 'S'
  const partes = nombre.trim().split(/\s+/)
  return partes.slice(0, 2).map((p) => p[0].toUpperCase()).join('')
}

function obtenerColorRol(rol) {
  const r = (rol || '').toUpperCase()
  if (r.includes('ADMIN')) return 'purple-8'
  if (r.includes('SUPER')) return 'blue-8'
  if (r.includes('RESPONSABLE')) return 'teal-8'
  if (r.includes('CONTRAT')) return 'orange-8'
  return 'grey-7'
}

function obtenerColorAccion(accion) {
  const a = (accion || '').toUpperCase()
  if (a.includes('APROBAR') || a.includes('FINALIZAR')) return 'positive'
  if (a.includes('RECHAZAR')) return 'negative'
  if (a.includes('CREAR')) return 'primary'
  if (a.includes('ACTUALIZAR')) return 'info'
  return 'grey-8'
}

function mostrarDetalle(reg) {
  eventoSeleccionado.value = reg
  modalDetalle.value = true
}
</script>
