<template>
  <q-page class="q-pa-lg">
    <!-- Encabezado -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h4 text-primary text-weight-bold">Gestión de Usuarios</div>
        <div class="text-subtitle2 text-grey-7">
          Administración de cuentas y roles del sistema GCCON-F-088
        </div>
      </div>

      <q-btn color="positive" icon="add" label="Nuevo Usuario" unelevated @click="nuevoUsuario" />
    </div>

    <!-- Filtro de Búsqueda -->
    <div class="row q-mb-md">
      <q-input
        v-model="filtro"
        outlined
        dense
        clearable
        style="width: 320px"
        placeholder="Buscar por documento, nombre o correo..."
      >
        <template #prepend>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>

    <!-- Tabla de Usuarios -->
    <q-table
      title="Listado de Usuarios"
      :rows="rows"
      :columns="columns"
      :filter="filtro"
      row-key="id"
      flat
      bordered
      :rows-per-page-options="[10, 25, 50, 0]"
      :pagination="{ rowsPerPage: 25 }"
      no-data-label="No hay usuarios registrados"
      no-results-label="No se encontraron coincidencias"
    >
      <template #body-cell-rol="props">
        <q-td :props="props">
          <q-badge
            :color="
              props.row.rol === 'Administrador'
                ? 'purple'
                : props.row.rol === 'Supervisor'
                  ? 'indigo'
                  : props.row.rol === 'Responsable de Área'
                    ? 'teal'
                    : 'blue-grey'
            "
            class="q-pa-xs text-weight-bold"
          >
            {{ props.row.rol }}
          </q-badge>
        </q-td>
      </template>

      <template #body-cell-acciones="props">
        <q-td :props="props">
          <q-btn flat round dense color="primary" icon="edit" @click="editarUsuario(props.row)">
            <q-tooltip>Editar Usuario</q-tooltip>
          </q-btn>

          <q-btn
            flat
            round
            dense
            color="negative"
            icon="person_off"
            @click="eliminarUsuario(props.row)"
          >
            <q-tooltip>Desactivar Usuario</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <!-- Diálogo Formulario Creación / Edición -->
    <q-dialog v-model="dialogo" persistent>
      <q-card style="min-width: 500px; max-width: 90vw">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6 text-primary text-weight-bold">
            {{ editando ? 'Editar Usuario' : 'Nuevo Usuario' }}
          </div>
          <q-btn icon="close" flat round dense v-close-popup @click="cancelar" />
        </q-card-section>

        <q-separator />

        <q-form @submit.prevent="guardarUsuario">
          <q-card-section class="q-gutter-y-sm">
            <q-input
              v-model="usuario.documento"
              label="Documento de Identidad *"
              outlined
              dense
              :disable="editando"
              :rules="[(val) => !!val || 'El documento es obligatorio']"
            />

            <q-input
              v-model="usuario.nombre"
              label="Nombre Completo *"
              outlined
              dense
              :rules="[(val) => !!val || 'El nombre es obligatorio']"
            />

            <q-input
              v-model="usuario.correo"
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

            <q-input v-model="usuario.telefono" label="Teléfono" outlined dense />

            <q-select
              v-model="usuario.rol"
              :options="roles"
              label="Rol de Usuario *"
              outlined
              dense
              :rules="[(val) => !!val || 'Debe seleccionar un rol']"
            />

            <q-input
              v-model="usuario.password"
              :label="editando ? 'Nueva Contraseña (Opcional)' : 'Contraseña *'"
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
          ¿Está seguro de desactivar al usuario
          <strong>{{ usuarioEliminar?.nombre || documentoEliminar }}</strong
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
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import api from '../services/api'
import { useAuthStore } from '../stores/authStore.js'

const $q = useQuasar()
const auth = useAuthStore()

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
    name: 'correo',
    label: 'Correo',
    field: 'correo',
    align: 'left',
    sortable: true,
  },
  {
    name: 'rol',
    label: 'Rol',
    field: 'rol',
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

const rows = ref([])
const filtro = ref('')
const dialogo = ref(false)
const dialogoEliminar = ref(false)
const documentoEliminar = ref('')
const editando = ref(false)
const indiceEditar = ref(null)
const mostrarPassword = ref(false)
const cargando = ref(false)
const guardando = ref(false)
const errorFormulario = ref('')

const roles = ['Administrador', 'Supervisor', 'Responsable de Área', 'Contratista']

const usuario = ref({
  documento: '',
  nombre: '',
  correo: '',
  telefono: '',
  rol: '',
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

function normalizarRolParaBackend(rolUI) {
  if (rolUI === 'Responsable de Área') return 'ResponsableArea'
  return rolUI || 'Contratista'
}

function normalizarRolParaUI(rolBackend) {
  if (rolBackend === 'ResponsableArea' || rolBackend === 'RESPONSABLE_AREA')
    return 'Responsable de Área'
  if (rolBackend === 'ADMINISTRADOR') return 'Administrador'
  if (rolBackend === 'SUPERVISOR') return 'Supervisor'
  if (rolBackend === 'CONTRATISTA') return 'Contratista'
  return rolBackend || 'Contratista'
}

const usuarioEliminar = ref(null)

async function cargarUsuarios() {
  cargando.value = true
  try {
    const resp = await api.get('/usuarios')
    const lista = Array.isArray(resp.data) ? resp.data : resp.data?.usuarios || []
    if (Array.isArray(lista)) {
      rows.value = lista.map((u, idx) => ({
        id: (u._id || u.id || `usr_${idx}`).toString(),
        documento: u.documento || u.telefono || `DOC-${idx + 1}`,
        nombre: u.nombre_completo || u.nombre || '—',
        correo: u.correo_institucional || u.correo || '—',
        telefono: u.telefono || '—',
        rol: normalizarRolParaUI(u.rol),
      }))
    }
  } catch (err) {
    console.warn('Error al cargar usuarios desde Atlas:', err)
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  cargarUsuarios()
})

async function guardarUsuario() {
  errorFormulario.value = ''
  const rolBackend = normalizarRolParaBackend(usuario.value.rol)

  if (!editando.value) {
    const doc = (usuario.value.documento || '').trim()
    const existeDocumento = doc && rows.value.some((item) => item.documento === doc)

    if (existeDocumento) {
      errorFormulario.value = 'Ya existe un usuario registrado con ese documento.'
      $q.notify({
        type: 'negative',
        message: 'Ya existe un usuario registrado con ese documento.',
      })
      return
    }

    if (!usuario.value.password) {
      const msg = 'La contraseña es obligatoria.'
      errorFormulario.value = msg
      $q.notify({
        type: 'warning',
        message: msg,
        position: 'top',
        timeout: 4000,
      })
      return
    }

    if (usuario.value.password.length < 8) {
      const msg = 'La contraseña debe tener mínimo 8 caracteres.'
      errorFormulario.value = msg
      $q.notify({
        type: 'warning',
        message: msg,
        position: 'top',
        timeout: 4000,
      })
      return
    }

    if (!/[A-Z]/.test(usuario.value.password)) {
      const msg = 'La contraseña debe incluir al menos una letra mayúscula.'
      errorFormulario.value = msg
      $q.notify({
        type: 'warning',
        message: msg,
        position: 'top',
        timeout: 4000,
      })
      return
    }

    if (!/[a-z]/.test(usuario.value.password)) {
      const msg = 'La contraseña debe incluir al menos una letra minúscula.'
      errorFormulario.value = msg
      $q.notify({
        type: 'warning',
        message: msg,
        position: 'top',
        timeout: 4000,
      })
      return
    }

    if (!/[0-9]/.test(usuario.value.password)) {
      const msg = 'La contraseña debe incluir al menos un número.'
      errorFormulario.value = msg
      $q.notify({
        type: 'warning',
        message: msg,
        position: 'top',
        timeout: 4000,
      })
      return
    }
  }

  guardando.value = true
  try {
    if (editando.value) {
      const uEditado = rows.value[indiceEditar.value]
      if (uEditado?.id) {
        await api.patch(`/usuarios/${uEditado.id}`, {
          nombre_completo: usuario.value.nombre,
          telefono: usuario.value.telefono,
          rol: rolBackend,
          ...(usuario.value.password ? { password: usuario.value.password } : {}),
        })
      }
      $q.notify({
        type: 'positive',
        message: 'Usuario actualizado correctamente.',
      })
    } else {
      // Guardar en MongoDB Atlas
      await api.post('/usuarios', {
        nombre: usuario.value.nombre,
        nombre_completo: usuario.value.nombre,
        correo: usuario.value.correo,
        correo_institucional: usuario.value.correo,
        documento: usuario.value.documento,
        telefono: usuario.value.telefono,
        rol: rolBackend,
        password: usuario.value.password,
      })

      // Registrar para inicio de sesión local también
      auth.registrarUsuarioLocal({
        nombre: usuario.value.nombre,
        correo: usuario.value.correo,
        password: usuario.value.password,
        rol: rolBackend.toUpperCase(),
      })

      $q.notify({
        type: 'positive',
        message: 'Usuario registrado exitosamente.',
      })
    }

    await cargarUsuarios()
    // Solo cerramos la planilla si la operación fue 100% exitosa
    limpiarFormulario()
  } catch (err) {
    console.error('Error al guardar en MongoDB Atlas:', err)
    const mensajeError =
      err.response?.data?.mensaje || err.mensaje || 'Error al guardar usuario en base de datos.'
    errorFormulario.value = mensajeError
    $q.notify({
      type: 'negative',
      message: mensajeError,
    })
    // No se limpia el formulario: los datos permanecen en pantalla para que el usuario los ajuste
  } finally {
    guardando.value = false
  }
}

function nuevoUsuario() {
  limpiarFormulario()
  dialogo.value = true
}

function editarUsuario(fila) {
  usuario.value = { ...fila, password: '' }
  indiceEditar.value = rows.value.findIndex((item) => item.id === fila.id)
  editando.value = true
  errorFormulario.value = ''
  dialogo.value = true
}

function eliminarUsuario(fila) {
  usuarioEliminar.value = fila
  documentoEliminar.value = fila.documento || fila.nombre || ''
  dialogoEliminar.value = true
}

async function confirmarEliminar() {
  try {
    const idParaBorrar =
      usuarioEliminar.value?.id || usuarioEliminar.value?._id || documentoEliminar.value
    const nom = usuarioEliminar.value?.nombre || 'Usuario'
    await api.delete(`/usuarios/${idParaBorrar}`)
    $q.notify({
      type: 'info',
      message: `Usuario "${nom}" desactivado correctamente.`,
    })
    await cargarUsuarios()
  } catch (err) {
    console.error('Error al desactivar:', err)
    $q.notify({
      type: 'negative',
      message: 'Error al desactivar usuario en base de datos.',
    })
  }
  dialogoEliminar.value = false
}

function cancelar() {
  limpiarFormulario()
}

function limpiarFormulario() {
  usuario.value = {
    documento: '',
    nombre: '',
    correo: '',
    telefono: '',
    rol: '',
    password: '',
  }
  errorFormulario.value = ''
  dialogo.value = false
  editando.value = false
  indiceEditar.value = null
  mostrarPassword.value = false
}
</script>
