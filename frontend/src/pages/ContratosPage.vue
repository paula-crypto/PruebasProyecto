<template>
  <q-page class="q-pa-lg">
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold text-grey-9">Contratos</div>
        <div class="text-subtitle1 text-grey-6">Registro contractual e inventario</div>
      </div>
      <q-btn
        v-if="puedeCrear"
        no-caps
        unelevated
        color="primary"
        icon="add"
        label="Nuevo contrato"
        @click="abrirNueva"
      />
    </div>

    <q-card flat bordered class="bg-white q-pa-md">
      <div class="row q-mb-md items-center q-gutter-md">
        <q-input
          v-model="filtro"
          outlined
          dense
          clearable
          style="width: 340px"
          placeholder="Buscar contrato..."
          class="q-mr-auto"
        >
          <template #prepend><q-icon name="search" /></template>
        </q-input>
        <q-btn
          outline
          no-caps
          unelevated
          size="sm"
          color="primary"
          icon="refresh"
          label="Actualizar"
          @click="cargar"
        />
      </div>

      <q-table
        :rows="rows"
        :columns="columns"
        :filter="filtro"
        row-key="id"
        flat
        bordered
        :loading="cargando"
        no-data-label="No hay contratos registrados."
        hide-bottom
      >
        <template #body-cell-estado="props">
          <q-td :props="props">
            <q-badge
              class="q-px-sm"
              :color="badgeColor(props.row.estado)"
              :text-color="badgeText(props.row.estado)"
              >{{ props.row.estado }}</q-badge
            >
          </q-td>
        </template>
        <template #body-cell-acciones="props">
          <q-td :props="props">
            <div class="row q-gutter-sm">
              <q-btn
                outline
                no-caps
                unelevated
                size="sm"
                label="Ver PDF"
                @click="verPdf(props.row)"
              />
              <q-btn
                outline
                no-caps
                unelevated
                size="sm"
                label="Observaciones"
                @click="verObservaciones(props.row)"
              />
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="dialogo">
      <q-card style="min-width: 740px; max-width: 860px">
        <q-card-section>
          <div class="text-h6 text-grey-9 q-mb-md">Crear Solicitud</div>
          <div class="row q-col-gutter-xl">
            <div class="col-12 col-md-6">
              <label class="campo-label">Número de contrato</label>
              <q-input
                v-model="form.numero"
                outlined
                dense
                placeholder="Ej: CT-001-2026"
                class="q-mb-md"
                :disable="procesando"
              />

              <label class="campo-label">Contratista</label>
              <q-input
                :model-value="auth.nombre"
                outlined
                dense
                readonly
                bg-color="grey-2"
                class="q-mb-md"
                :disable="procesando"
              />

              <label class="campo-label">Fecha de solicitud</label>
              <q-input
                :model-value="fechaHoy"
                outlined
                dense
                readonly
                bg-color="grey-2"
                class="q-mb-md"
                :disable="procesando"
              />

              <label class="campo-label">Teléfono</label>
              <q-input
                v-model="form.telefono"
                outlined
                dense
                class="q-mb-md"
                :disable="procesando"
              />
            </div>

            <div class="col-12 col-md-6">
              <div class="text-subtitle2 q-mb-sm">Dependencias a Firmar</div>
              <div class="row q-col-gutter-sm q-mb-md">
                <div v-for="dep in opcionesDependencias" :key="dep.value" class="col-6">
                  <q-checkbox
                    v-model="dependenciasFirmar"
                    :val="dep.value"
                    :label="dep.label"
                    dense
                    :disable="procesando"
                  />
                </div>
              </div>

              <div class="text-subtitle2 q-mb-sm">Bienes entregados</div>
              <q-list v-if="form.bienes.length" bordered class="q-mb-sm">
                <q-item v-for="(b, i) in form.bienes" :key="i" dense>
                  <q-item-section>
                    <q-item-label>{{ b.descripcion }}</q-item-label>
                    <q-item-label caption>Inventario: {{ b.codigo_inventario }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn
                      flat
                      round
                      dense
                      color="negative"
                      icon="delete"
                      @click="form.bienes.splice(i, 1)"
                    />
                  </q-item-section>
                </q-item>
              </q-list>
              <q-input
                v-model="bienNuevo.descripcion"
                outlined
                dense
                placeholder="Descripción"
                class="q-mb-sm"
              />
              <q-input
                v-model="bienNuevo.codigo_inventario"
                outlined
                dense
                placeholder="Código de inventario"
                class="q-mb-sm"
                @keyup.enter="agregarBien"
              />
              <q-btn
                flat
                no-caps
                unelevated
                size="sm"
                color="primary"
                icon="add"
                label="Agregar bien"
                @click="agregarBien"
              />
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup @click="dialogo = false" />
          <q-btn
            no-caps
            unelevated
            color="primary"
            label="Guardar"
            :loading="procesando"
            @click="guardar"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogoObs">
      <q-card style="min-width: 520px">
        <q-card-section>
          <div class="text-h6 text-grey-9">Observaciones</div>
          <div class="text-caption text-grey-6">{{ observacion.contrato || '' }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <template v-if="observacion.supervisor">
            <div class="text-subtitle2 text-grey-8 q-mb-sm">Observación del supervisor</div>
            <q-input
              :model-value="observacion.supervisor"
              outlined
              dense
              readonly
              type="textarea"
              bg-color="grey-2"
            />
          </template>
          <q-list v-if="observacion.areas.length" bordered class="q-mt-sm">
            <q-item v-for="(a, i) in observacion.areas" :key="i" dense>
              <q-item-section>
                <q-item-label>{{ a.area || 'Área' }}</q-item-label>
                <q-item-label caption>{{ a.observacion }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge
                  :color="a.estado === 'Rechazado' ? 'red-2' : 'green-2'"
                  :text-color="a.estado === 'Rechazado' ? 'red-9' : 'green-9'"
                  >{{ a.estado }}</q-badge
                >
              </q-item-section>
            </q-item>
          </q-list>
          <div v-else-if="!observacion.supervisor" class="text-grey-6 q-mt-sm">
            No hay observaciones registradas.
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="grey" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <FirmaPdfPreview v-model="mostrarPdf" :item="seleccionado" :pdf-url="pdfUrl" />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useQuasar } from 'quasar'
import api from '../services/api'
import FirmaPdfPreview from '../components/FirmaPdfPreview.vue'
import { useAuthStore } from '../stores/authStore'

const $q = useQuasar()
const auth = useAuthStore()
const puedeCrear = computed(() => auth.rol === 'Contratista')

const rows = ref([])
const filtro = ref('')
const cargando = ref(false)
const procesando = ref(false)
const dialogo = ref(false)
const dialogoObs = ref(false)
const mostrarPdf = ref(false)
const pdfUrl = ref('')
const dependencias = ref([])
const dependenciasFirmar = ref([])
const bienNuevo = ref({ descripcion: '', codigo_inventario: '' })
const form = ref(defaultForm())
const observacion = ref({ contrato: '', supervisor: '', areas: [] })
const seleccionado = ref(null)
const fechaHoy = new Date().toLocaleDateString('es-CO')

const columns = [
  { name: 'numero', label: 'Contrato', field: 'numero', align: 'left' },
  { name: 'contratista', label: 'Contratista', field: 'contratista', align: 'left' },
  { name: 'dependencia', label: 'Dependencia', field: 'dependencia', align: 'left' },
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' },
]

const opcionesDependencias = computed(() =>
  dependencias.value.map((d) => ({ label: d.nombre_dependencia, value: d._id })),
)

function defaultForm() {
  return { numero: '', telefono: '', dependencia: '', bienes: [] }
}

onMounted(cargar)
onBeforeUnmount(() => {
  if (pdfUrl.value) window.URL.revokeObjectURL(pdfUrl.value)
})

async function cargar() {
  cargando.value = true
  const url = auth.rol === 'Contratista' ? '/api/contratos/mis-solicitudes' : '/api/contratos'
  try {
    const { data } = await api.get(url)
    rows.value = data.map((c) => ({
      id: c._id,
      numero: c.numero_contrato,
      contratista: c.nombre_contratista,
      dependencia: c.dependencia?.nombre_dependencia || '—',
      fecha: c.createdAt ? new Date(c.createdAt).toLocaleDateString('es-CO') : '—',
      estado:
        c.estado === 'Pendiente de Firmas' || c.estado === 'EnProceso' ? 'En revisión' : c.estado,
    }))
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.mensaje || 'No se pudieron cargar los contratos.',
    })
  } finally {
    cargando.value = false
  }
}

function abrirNueva() {
  form.value = defaultForm()
  bienNuevo.value = { descripcion: '', codigo_inventario: '' }
  dependenciasFirmar.value = []
  dialogo.value = true
  if (!dependencias.value.length) cargarDependencias()
}

async function cargarDependencias() {
  try {
    const { data } = await api.get('/api/dependencias')
    dependencias.value = data
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.mensaje || 'No se pudieron cargar las dependencias.',
    })
  }
}

function agregarBien() {
  if (!bienNuevo.value.descripcion || !bienNuevo.value.codigo_inventario) {
    $q.notify({ type: 'warning', message: 'Complete la descripción y el código del bien.' })
    return
  }
  form.value.bienes.push({ ...bienNuevo.value })
  bienNuevo.value = { descripcion: '', codigo_inventario: '' }
}

async function guardar() {
  if (!form.value.numero || !form.value.telefono) {
    $q.notify({ type: 'warning', message: 'Número de contrato y teléfono son obligatorios.' })
    return
  }
  if (!dependenciasFirmar.value.length) {
    $q.notify({ type: 'warning', message: 'Seleccione al menos una dependencia a firmar.' })
    return
  }
  if (!form.value.bienes.length) {
    $q.notify({ type: 'warning', message: 'Agregue al menos un bien.' })
    return
  }
  procesando.value = true
  try {
    await api.post('/api/contratos/nuevo', {
      numero: form.value.numero,
      telefono: form.value.telefono,
      dependencia: dependenciasFirmar.value[0],
      bienes: form.value.bienes,
    })
    $q.notify({ type: 'positive', message: 'Solicitud creada correctamente.' })
    dialogo.value = false
    await cargar()
  } catch (error) {
    $q.notify({ type: 'negative', message: error.mensaje || 'No se pudo crear la solicitud.' })
  } finally {
    procesando.value = false
  }
}

function badgeColor(estado) {
  switch (estado) {
    case 'Finalizado':
    case 'Aprobado':
      return 'green-1'
    case 'Rechazado':
      return 'red-1'
    case 'En revisión':
    case 'Pendiente de Firmas':
    case 'EnProceso':
      return 'light-blue-1'
    default:
      return 'grey-3'
  }
}

function badgeText(estado) {
  switch (estado) {
    case 'Finalizado':
    case 'Aprobado':
      return 'green-9'
    case 'Rechazado':
      return 'red-9'
    case 'En revisión':
    case 'Pendiente de Firmas':
    case 'EnProceso':
      return 'light-blue-9'
    default:
      return 'grey-8'
  }
}

async function verPdf(fila) {
  seleccionado.value = { ...fila, area: fila.dependencia }
  if (pdfUrl.value) {
    window.URL.revokeObjectURL(pdfUrl.value)
    pdfUrl.value = ''
  }
  if (fila.estado === 'Finalizado') {
    try {
      const respuesta = await api.get(`/api/contratos/${fila.id}/pdf`, { responseType: 'blob' })
      pdfUrl.value = window.URL.createObjectURL(respuesta.data)
    } catch (error) {
      $q.notify({ type: 'negative', message: error.mensaje || 'No se pudo cargar el PDF.' })
    }
  }
  mostrarPdf.value = true
}

async function verObservaciones(fila) {
  try {
    const { data } = await api.get(`/api/contratos/${fila.id}/observaciones`)
    observacion.value = {
      contrato: fila.numero,
      supervisor: data.observaciones_supervisor || '',
      areas: data.observaciones_areas || [],
    }
    dialogoObs.value = true
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.mensaje || 'No se pudieron cargar las observaciones.',
    })
  }
}
</script>

<style scoped>
.campo-label {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: #444;
  margin-bottom: 6px;
  letter-spacing: 0.3px;
}
</style>
