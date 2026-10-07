<template>
  <q-page class="q-pa-lg">
    <!-- Encabezado -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h4 text-primary text-weight-bold">Contratistas</div>
        <div class="text-subtitle2 text-grey-7">
          Gestión de contratistas del sistema GCCON-F-088
        </div>
      </div>

      <q-btn
        color="positive"
        icon="add"
        label="Nuevo Contratista"
        unelevated
        @click="nuevoContratista"
      />
    </div>

    <!-- Filtro de Búsqueda -->
    <div class="row q-mb-md">
      <q-input
        v-model="filtro"
        outlined
        dense
        clearable
        style="width: 320px"
        placeholder="Buscar contratista..."
      >
        <template #prepend>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>

    <!-- Tabla de Contratistas -->
    <q-table
      title="Listado de Contratistas"
      :rows="store.contratistas || []"
      :columns="columns"
      :filter="filtro"
      row-key="id"
      flat
      bordered
      :rows-per-page-options="[10, 25, 50, 0]"
      :pagination="{ rowsPerPage: 25 }"
      no-data-label="No hay contratistas registrados"
      no-results-label="No se encontraron coincidencias"
    >
      <template #body-cell-numeroContrato="props">
        <q-td :props="props">
          <q-badge color="blue-1" text-color="primary" class="text-weight-bold q-pa-xs">
            <q-icon name="description" class="q-mr-xs" />
            {{ props.row.numeroContrato || 'Sin contrato' }}
          </q-badge>
        </q-td>
      </template>

      <template #body-cell-supervisor="props">
        <q-td :props="props">
          <q-badge color="teal-1" text-color="teal-9" class="text-weight-bold q-pa-xs">
            <q-icon name="person" class="q-mr-xs" />
            {{ props.row.supervisor || 'Ing. Carlos Supervisor' }}
          </q-badge>
        </q-td>
      </template>

      <template #body-cell-dependencia="props">
        <q-td :props="props">
          <q-badge color="purple-1" text-color="purple-9" class="text-weight-bold q-pa-xs">
            <q-icon name="apartment" class="q-mr-xs" />
            {{ props.row.dependencia || 'Gestión Tecnológica (TIC)' }}
          </q-badge>
        </q-td>
      </template>

      <template #body-cell-acciones="props">
        <q-td :props="props">
          <q-btn flat round dense color="primary" icon="edit" @click="editarContratista(props.row)">
            <q-tooltip>Editar Contratista</q-tooltip>
          </q-btn>

          <q-btn
            flat
            round
            dense
            color="negative"
            icon="person_off"
            @click="eliminarContratista(props.row)"
          >
            <q-tooltip>Desactivar Contratista</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <!-- Diálogo Formulario Creación / Edición -->
    <q-dialog v-model="dialogo" persistent>
      <q-card style="min-width: 500px; max-width: 90vw">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6 text-primary text-weight-bold">
            {{ editando ? 'Editar Contratista' : 'Nuevo Contratista' }}
          </div>
          <q-btn icon="close" flat round dense v-close-popup @click="cancelar" />
        </q-card-section>

        <q-separator />

        <q-form @submit.prevent="guardarContratista">
          <q-card-section class="q-gutter-y-sm">
            <q-input
              v-model="contratista.documento"
              label="Documento de Identidad *"
              outlined
              dense
              :disable="editando"
              :rules="[(val) => !!val || 'El documento es obligatorio']"
            />

            <q-input
              v-model="contratista.nombre"
              label="Nombre Completo *"
              outlined
              dense
              :rules="[(val) => !!val || 'El nombre es obligatorio']"
            />

            <q-input
              v-model="contratista.numeroContrato"
              label="Número de Contrato (Vigencia Actual) *"
              placeholder="Ej. CNT-2026-001"
              outlined
              dense
              :rules="[(val) => !!val || 'El número de contrato es obligatorio']"
              hint="Código oficial del contrato supervisado (se actualiza por año/vigencia)"
            >
              <template #prepend>
                <q-icon name="description" color="primary" />
              </template>
            </q-input>

            <!-- Asignación de Supervisor y Dependencia por Defecto -->
            <div v-if="esSupervisor" class="q-py-xs">
              <q-banner rounded dense class="bg-blue-1 text-primary border-blue q-mb-xs">
                <template #avatar>
                  <q-icon name="verified_user" color="primary" />
                </template>
                <div class="text-caption">
                  <strong>Supervisor a cargo:</strong> {{ contratista.supervisor }}<br />
                  <strong>Dependencia por defecto:</strong> {{ contratista.dependencia }}
                </div>
              </q-banner>
            </div>
            <div v-else class="row q-col-gutter-sm">
              <div class="col-12 col-md-6">
                <q-select
                  v-model="contratista.supervisor"
                  :options="opcionesSupervisores"
                  label="Supervisor Asignado *"
                  outlined
                  dense
                  emit-value
                  map-options
                  @update:model-value="onSeleccionarSupervisor"
                  :rules="[(val) => !!val || 'El supervisor es obligatorio']"
                >
                  <template #prepend>
                    <q-icon name="person" color="primary" />
                  </template>
                </q-select>
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="contratista.dependencia"
                  label="Dependencia por Defecto"
                  outlined
                  dense
                  readonly
                  hint="Asignada automáticamente por el supervisor"
                >
                  <template #prepend>
                    <q-icon name="apartment" color="primary" />
                  </template>
                </q-input>
              </div>
            </div>

            <q-input
              v-model="contratista.correo"
              label="Correo Electrónico *"
              outlined
              dense
              type="email"
              :rules="[
                (val) => !!val || 'El correo es obligatorio',
                (val) =>
                  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Ingrese un correo electrónico válido',
              ]"
            />

            <q-input
              v-model="contratista.telefono"
              label="Teléfono de Contacto *"
              outlined
              dense
              :rules="[(val) => !!val || 'El teléfono es obligatorio']"
            />

            <q-input
              v-model="contratista.password"
              :label="editando ? 'Nueva Contraseña (Opcional)' : 'Contraseña de Acceso *'"
              :type="mostrarPassword ? 'text' : 'password'"
              outlined
              dense
              hint="Mínimo 8 caracteres, con mayúscula, minúscula y número"
              @focus="avisarRequisitosPassword"
              :rules="
                editando
                  ? [
                      (val) => !val || val.length >= 8 || 'Mínimo 8 caracteres',
                      (val) => !val || /[A-Z]/.test(val) || 'Debe incluir al menos una mayúscula',
                      (val) => !val || /[a-z]/.test(val) || 'Debe incluir al menos una minúscula',
                      (val) => !val || /[0-9]/.test(val) || 'Debe incluir al menos un número',
                    ]
                  : [
                      (val) => !!val || 'La contraseña es obligatoria',
                      (val) => (val && val.length >= 8) || 'Mínimo 8 caracteres',
                      (val) => /[A-Z]/.test(val) || 'Debe incluir al menos una mayúscula',
                      (val) => /[a-z]/.test(val) || 'Debe incluir al menos una minúscula',
                      (val) => /[0-9]/.test(val) || 'Debe incluir al menos un número',
                    ]
              "
            >
              <template #append>
                <q-icon
                  :name="mostrarPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="mostrarPassword = !mostrarPassword"
                />
              </template>
            </q-input>

            <!-- Banner de error si falla la validación en backend (sin cerrar planilla) -->
            <div v-if="errorFormulario" class="q-mt-sm">
              <q-banner rounded dense class="bg-red-1 text-negative text-caption">
                <template #avatar>
                  <q-icon name="error_outline" color="negative" />
                </template>
                {{ errorFormulario }}
              </q-banner>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat label="Cancelar" color="grey-8" @click="cancelar" :disable="guardando" />
            <q-btn unelevated type="submit" color="positive" label="Guardar" :loading="guardando" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Diálogo Confirmar Desactivación -->
    <q-dialog v-model="dialogoEliminar">
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <q-avatar icon="person_off" color="negative" text-color="white" class="q-mr-sm" />
          <span class="text-h6">Confirmar desactivación</span>
        </q-card-section>

        <q-card-section class="q-pt-none text-body1">
          ¿Está seguro de desactivar al contratista
          <strong>{{ nombreContratistaEliminar }}</strong
          >?
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-8" v-close-popup />
          <q-btn unelevated color="negative" label="Desactivar" @click="confirmarEliminar" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useContratistasStore } from '../stores/useContratistasStore.js'
import { useSupervisoresStore } from '../stores/useSupervisoresStore.js'
import { useAuthStore } from '../stores/authStore.js'

// Instancia de los Stores
const store = useContratistasStore()
const supervisoresStore = useSupervisoresStore()
const auth = useAuthStore()
const $q = useQuasar()

const esSupervisor = computed(() => auth.rolUsuario === 'SUPERVISOR')

onMounted(async () => {
  if (supervisoresStore.cargarSupervisores) {
    await supervisoresStore.cargarSupervisores()
  }
})

const opcionesSupervisores = computed(() => {
  return (supervisoresStore.supervisores || []).map((s) => ({
    label: `${s.nombre} (${s.dependencia || 'Gestión Tecnológica (TIC)'})`,
    value: s.nombre,
    dependencia: s.dependencia || 'Gestión Tecnológica (TIC)',
  }))
})

function onSeleccionarSupervisor(nombre) {
  if (!nombre) return
  const sup = (supervisoresStore.supervisores || []).find(
    (s) => s.nombre.toLowerCase().trim() === String(nombre).toLowerCase().trim(),
  )
  if (sup) {
    contratista.value.supervisor = sup.nombre
    contratista.value.dependencia = sup.dependencia || 'Gestión Tecnológica (TIC)'
  }
}

const dialogo = ref(false)
const dialogoEliminar = ref(false)
const documentoEliminar = ref('')
const contratistaSeleccionadoEliminar = ref(null)

const nombreContratistaEliminar = computed(() => {
  if (contratistaSeleccionadoEliminar.value) {
    return (
      contratistaSeleccionadoEliminar.value.nombre ||
      contratistaSeleccionadoEliminar.value.nombre_completo ||
      documentoEliminar.value ||
      'el contratista'
    )
  }
  const c = store.contratistas.find(
    (item) => item.documento === documentoEliminar.value || item._id === documentoEliminar.value,
  )
  return c?.nombre || c?.nombre_completo || documentoEliminar.value || 'el contratista'
})
const editando = ref(false)
const indiceEditar = ref(null)
const filtro = ref('')
const mostrarPassword = ref(false)
const guardando = ref(false)
const errorFormulario = ref('')

const contratista = ref({
  documento: '',
  nombre: '',
  numeroContrato: '',
  supervisor: '',
  dependencia: '',
  correo: '',
  telefono: '',
  password: '',
})

function avisarRequisitosPassword() {
  $q.notify({
    type: 'info',
    icon: 'lock',
    message:
      'Requisitos de la contraseña: mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número.',
    position: 'top',
    timeout: 4000,
  })
}

const columns = [
  {
    name: 'documento',
    label: 'Documento',
    field: 'documento',
    align: 'left',
    sortable: true,
  },
  {
    name: 'nombre',
    label: 'Nombre',
    field: 'nombre',
    align: 'left',
    sortable: true,
  },
  {
    name: 'numeroContrato',
    label: 'Contrato Asignado',
    field: (row) => row.numeroContrato || '—',
    align: 'left',
    sortable: true,
  },
  {
    name: 'supervisor',
    label: 'Supervisor Asignado',
    field: (row) => row.supervisor || 'Ing. Carlos Supervisor',
    align: 'left',
    sortable: true,
  },
  {
    name: 'dependencia',
    label: 'Dependencia',
    field: (row) => row.dependencia || 'Gestión Tecnológica (TIC)',
    align: 'left',
    sortable: true,
  },
  {
    name: 'correo',
    label: 'Correo',
    field: 'correo',
    align: 'left',
    sortable: true,
  },
  {
    name: 'telefono',
    label: 'Teléfono',
    field: 'telefono',
    align: 'left',
    sortable: true,
  },
  {
    name: 'acciones',
    label: 'Acciones',
    field: 'acciones',
    align: 'center',
  },
]

async function guardarContratista() {
  errorFormulario.value = ''
  const lista = store.contratistas

  if (!editando.value) {
    const existeDocumento = lista.some((item) => item.documento === contratista.value.documento)

    if (existeDocumento) {
      errorFormulario.value = 'Ya existe un contratista registrado con ese documento.'
      $q.notify({
        type: 'negative',
        message: 'Ya existe un contratista registrado con ese documento.',
        position: 'top',
      })
      return
    }

    if (!contratista.value.password) {
      const msg = 'La contraseña es obligatoria.'
      errorFormulario.value = msg
      $q.notify({ type: 'warning', message: msg, position: 'top', timeout: 4000 })
      return
    }

    if (contratista.value.password.length < 8) {
      const msg = 'La contraseña debe tener mínimo 8 caracteres.'
      errorFormulario.value = msg
      $q.notify({ type: 'warning', message: msg, position: 'top', timeout: 4000 })
      return
    }

    if (!/[A-Z]/.test(contratista.value.password)) {
      const msg = 'La contraseña debe incluir al menos una letra mayúscula.'
      errorFormulario.value = msg
      $q.notify({ type: 'warning', message: msg, position: 'top', timeout: 4000 })
      return
    }

    if (!/[a-z]/.test(contratista.value.password)) {
      const msg = 'La contraseña debe incluir al menos una letra minúscula.'
      errorFormulario.value = msg
      $q.notify({ type: 'warning', message: msg, position: 'top', timeout: 4000 })
      return
    }

    if (!/[0-9]/.test(contratista.value.password)) {
      const msg = 'La contraseña debe incluir al menos un número.'
      errorFormulario.value = msg
      $q.notify({ type: 'warning', message: msg, position: 'top', timeout: 4000 })
      return
    }
  }

  guardando.value = true
  try {
    if (editando.value) {
      store.editar(indiceEditar.value, { ...contratista.value })
      $q.notify({
        type: 'positive',
        message: 'Contratista actualizado correctamente.',
      })
    } else {
      await store.agregar({ ...contratista.value })
      $q.notify({
        type: 'positive',
        message: 'Contratista registrado correctamente.',
      })
    }
    // Solo cerramos la planilla cuando la operación tiene éxito
    limpiarFormulario()
  } catch (err) {
    const mensajeError =
      err.response?.data?.mensaje ||
      err.mensaje ||
      'Error al guardar contratista en la base de datos.'
    errorFormulario.value = mensajeError
    $q.notify({
      type: 'negative',
      message: mensajeError,
      position: 'top',
    })
    // No se llama a limpiarFormulario() para que la ventana permanezca abierta con los datos
  } finally {
    guardando.value = false
  }
}

function nuevoContratista() {
  limpiarFormulario()
  const siguienteNum = (store.contratistas.length + 1).toString().padStart(3, '0')
  contratista.value.numeroContrato = `CNT-2026-${siguienteNum}`

  if (esSupervisor.value) {
    const miNombre = auth.usuario?.nombre || 'Ing. Carlos Supervisor'
    contratista.value.supervisor = miNombre
    const supEncontrado = (supervisoresStore.supervisores || []).find(
      (s) => s.nombre.toLowerCase().trim() === miNombre.toLowerCase().trim(),
    )
    contratista.value.dependencia =
      auth.usuario?.dependencia || supEncontrado?.dependencia || 'Gestión Tecnológica (TIC)'
  } else {
    // Si es Administrador, autoasigna por defecto el primer supervisor y su respectiva dependencia
    const primerSup = (supervisoresStore.supervisores || [])[0]
    if (primerSup) {
      contratista.value.supervisor = primerSup.nombre
      contratista.value.dependencia = primerSup.dependencia || 'Gestión Tecnológica (TIC)'
    } else {
      contratista.value.supervisor = 'Ing. Carlos Supervisor'
      contratista.value.dependencia = 'Gestión Tecnológica (TIC)'
    }
  }

  dialogo.value = true
}

function editarContratista(fila) {
  const lista = store.contratistas

  contratista.value = {
    ...fila,
    numeroContrato: fila.numeroContrato || '',
    supervisor: fila.supervisor || 'Ing. Carlos Supervisor',
    dependencia: fila.dependencia || 'Gestión Tecnológica (TIC)',
    password: fila.password || '',
  }

  indiceEditar.value = lista.findIndex((item) => item.documento === fila.documento)

  editando.value = true
  errorFormulario.value = ''
  dialogo.value = true
}

function eliminarContratista(item) {
  if (typeof item === 'object' && item !== null) {
    contratistaSeleccionadoEliminar.value = item
    documentoEliminar.value = item.documento || item._id || ''
  } else {
    documentoEliminar.value = item
    contratistaSeleccionadoEliminar.value =
      store.contratistas.find((c) => c.documento === item || c._id === item) || null
  }
  dialogoEliminar.value = true
}

function confirmarEliminar() {
  const nombreCon = nombreContratistaEliminar.value
  store.eliminar(documentoEliminar.value)

  documentoEliminar.value = ''
  contratistaSeleccionadoEliminar.value = null
  dialogoEliminar.value = false
  $q.notify({
    type: 'info',
    message: `Contratista "${nombreCon}" desactivado correctamente.`,
  })
}

function cancelar() {
  limpiarFormulario()
}

function limpiarFormulario() {
  contratista.value = {
    documento: '',
    nombre: '',
    numeroContrato: '',
    supervisor: '',
    dependencia: '',
    correo: '',
    telefono: '',
    password: '',
  }
  errorFormulario.value = ''
  dialogo.value = false
  editando.value = false
  indiceEditar.value = null
  mostrarPassword.value = false
}
</script>
