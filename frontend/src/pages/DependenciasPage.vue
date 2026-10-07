<template>
  <q-page class="q-pa-lg">
    <!-- Encabezado -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h4 text-primary text-weight-bold">Dependencias</div>
        <div class="text-subtitle2 text-grey-7">
          Gestión de áreas responsables del formato GCCON-F-088
        </div>
      </div>

      <q-btn
        color="positive"
        icon="add"
        label="Nueva Dependencia"
        unelevated
        @click="nuevaDependencia"
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
        placeholder="Buscar dependencia..."
      >
        <template #prepend>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>

    <!-- Tabla de Dependencias -->
    <q-table
      title="Listado de Dependencias"
      :rows="store.dependencias"
      :columns="columns"
      :filter="filtro"
      row-key="codigo"
      flat
      bordered
      :loading="store.cargando"
      :rows-per-page-options="[10, 25, 50, 0]"
      :pagination="{ rowsPerPage: 25 }"
      no-data-label="No hay dependencias registradas"
      no-results-label="No se encontraron coincidencias"
    >
      <template #body-cell-estado="props">
        <q-td :props="props">
          <q-badge
            :color="
              props.row.estado === 'Inactivo' || props.row.estado === 'Inactiva'
                ? 'negative'
                : 'positive'
            "
            class="q-pa-xs text-weight-bold"
          >
            {{
              props.row.estado === 'Inactivo' || props.row.estado === 'Inactiva'
                ? 'Inactiva'
                : 'Activa'
            }}
          </q-badge>
        </q-td>
      </template>

      <template #body-cell-acciones="props">
        <q-td :props="props">
          <q-btn flat round dense color="primary" icon="edit" @click="editarDependencia(props.row)">
            <q-tooltip>Editar Dependencia</q-tooltip>
          </q-btn>

          <q-btn
            flat
            round
            dense
            color="negative"
            icon="domain_disabled"
            @click="eliminarDependencia(props.row)"
          >
            <q-tooltip>{{
              props.row.estado === 'Inactivo' || props.row.estado === 'Inactiva'
                ? 'Activar Dependencia'
                : 'Desactivar Dependencia'
            }}</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <!-- Diálogo Formulario Creación / Edición -->
    <q-dialog v-model="dialogo" persistent>
      <q-card style="min-width: 500px; max-width: 90vw">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6 text-primary text-weight-bold">
            {{ editando ? 'Editar Dependencia' : 'Nueva Dependencia' }}
          </div>
          <q-btn icon="close" flat round dense v-close-popup @click="cancelar" />
        </q-card-section>

        <q-separator />

        <q-form @submit.prevent="guardarDependencia">
          <q-card-section class="q-gutter-y-sm">
            <q-banner dense rounded class="bg-green-1 text-positive q-mb-sm">
              <template #avatar>
                <q-icon name="verified_user" color="positive" />
              </template>
              <div class="text-caption">
                <strong>Destinatario oficial:</strong> Toda solicitud o paz y salvo vinculado a esta
                dependencia va dirigido directamente a este Responsable de Área para su revisión y
                firma oficial.
              </div>
            </q-banner>

            <q-input
              v-model="dependencia.codigo"
              label="Código de la Dependencia *"
              outlined
              dense
              :disable="editando"
              :rules="[(val) => !!val || 'El código es obligatorio']"
            >
              <template #prepend>
                <q-icon name="tag" color="grey-7" />
              </template>
            </q-input>

            <!-- Nombre de la Dependencia con sugerencias estándar -->
            <q-select
              v-model="dependencia.nombre"
              label="Nombre de la Dependencia *"
              outlined
              dense
              use-input
              fill-input
              hide-selected
              input-debounce="0"
              new-value-mode="add-unique"
              :options="filtroNombresDependencias"
              option-label="nombre"
              option-value="nombre"
              emit-value
              map-options
              @filter="filtrarNombresDependencias"
              @update:model-value="onSeleccionarNombreDependencia"
              :rules="[(val) => !!val || 'El nombre es obligatorio']"
              hint="Elija un área estándar o escriba un nombre personalizado"
            >
              <template #prepend>
                <q-icon name="business" color="primary" />
              </template>
              <template #option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-avatar
                      :icon="scope.opt.icono || 'business'"
                      color="primary"
                      text-color="white"
                      size="sm"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-bold">{{ scope.opt.nombre }}</q-item-label>
                    <q-item-label caption>{{ scope.opt.descripcion }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <!-- Responsable de Área con Selección Automática -->
            <q-select
              v-model="responsableSeleccionado"
              label="Responsable de Área Destinatario *"
              outlined
              dense
              :options="opcionesResponsables"
              option-label="etiqueta"
              use-input
              input-debounce="0"
              new-value-mode="add-unique"
              @update:model-value="onSeleccionarResponsable"
              :rules="[
                (val) => !!dependencia.responsable || !!val || 'El responsable es obligatorio',
              ]"
              hint="Seleccione el responsable registrado o escriba uno nuevo"
            >
              <template #prepend>
                <q-icon name="badge" color="primary" />
              </template>
              <template #option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-avatar icon="person" color="primary" text-color="white" size="sm" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-bold">{{ scope.opt.nombre }}</q-item-label>
                    <q-item-label caption>{{
                      scope.opt.correo || 'Responsable de Área'
                    }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <q-input
              v-model="dependencia.correo"
              label="Correo Institucional del Responsable *"
              outlined
              dense
              type="email"
              :rules="[
                (val) => !!val || 'El correo es obligatorio',
                (val) =>
                  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Ingrese un correo electrónico válido',
              ]"
            >
              <template #prepend>
                <q-icon name="email" color="grey-7" />
              </template>
            </q-input>

            <!-- Estado: Activa por defecto al crear, editable solo al editar -->
            <div
              v-if="!editando"
              class="row items-center q-pa-sm bg-green-1 text-positive rounded-borders q-mt-xs"
            >
              <q-icon name="check_circle" color="positive" size="sm" class="q-mr-sm" />
              <div class="text-caption">
                <strong>Estado:</strong> Activa (queda habilitada automáticamente para recibir
                solicitudes y firmas).
              </div>
            </div>

            <q-select
              v-else
              v-model="dependencia.estado"
              :options="['Activa', 'Inactiva']"
              label="Estado de la Dependencia"
              outlined
              dense
            >
              <template #prepend>
                <q-icon
                  name="toggle_on"
                  :color="dependencia.estado === 'Activa' ? 'positive' : 'grey-7'"
                />
              </template>
            </q-select>
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat label="Cancelar" color="grey-8" @click="cancelar" />
            <q-btn
              unelevated
              type="submit"
              color="positive"
              label="Guardar Dependencia"
              icon="save"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Diálogo Confirmar Desactivación / Activación -->
    <q-dialog v-model="dialogoEliminar">
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <q-avatar
            :icon="esInactivaSeleccionada ? 'check_circle' : 'domain_disabled'"
            :color="esInactivaSeleccionada ? 'positive' : 'negative'"
            text-color="white"
            class="q-mr-sm"
          />
          <span class="text-h6">{{
            esInactivaSeleccionada ? 'Confirmar activación' : 'Confirmar desactivación'
          }}</span>
        </q-card-section>

        <q-card-section class="q-pt-none text-body1">
          ¿Está seguro de {{ esInactivaSeleccionada ? 'activar' : 'desactivar' }} la dependencia
          <strong>{{ nombreEliminar }}</strong
          >?
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-8" v-close-popup />
          <q-btn
            unelevated
            :color="esInactivaSeleccionada ? 'positive' : 'negative'"
            :label="esInactivaSeleccionada ? 'Activar' : 'Desactivar'"
            @click="confirmarEliminar"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useDependenciasStore } from '../stores/useDependenciasStore.js'
import api from '../services/api'

const $q = useQuasar()
const store = useDependenciasStore()

const filtro = ref('')
const dialogo = ref(false)
const dialogoEliminar = ref(false)
const codigoEliminar = ref('')
const editando = ref(false)
const indiceEditar = ref(null)
const responsableSeleccionado = ref(null)

const responsablesPredefinidos = [
  {
    id: 'usr_tic',
    nombre: 'Ing. Roberto Gómez',
    correo: 'area.tic@gccon.com',
    dependenciaSugerida: 'Gestión Tecnológica (TIC)',
    etiqueta: 'Ing. Roberto Gómez (Gestión Tecnológica - TIC)',
  },
  {
    id: 'usr_almacen',
    nombre: 'Lic. Martha Almacén',
    correo: 'area.almacen@gccon.com',
    dependenciaSugerida: 'Almacén e Inventarios',
    etiqueta: 'Lic. Martha Almacén (Almacén e Inventarios)',
  },
  {
    id: 'usr_rrhh',
    nombre: 'Dra. Claudia Ramos',
    correo: 'rrhh@sena.edu.co',
    dependenciaSugerida: 'Recursos Humanos / Talento Humano',
    etiqueta: 'Dra. Claudia Ramos (Talento Humano)',
  },
  {
    id: 'usr_infra',
    nombre: 'Ing. Fernando Ramírez',
    correo: 'infraestructura@sena.edu.co',
    dependenciaSugerida: 'Infraestructura y Servicios Generales',
    etiqueta: 'Ing. Fernando Ramírez (Infraestructura y Servicios)',
  },
  {
    id: 'usr_biblio',
    nombre: 'Lic. Jorge Biblioteca',
    correo: 'biblioteca@sena.edu.co',
    dependenciaSugerida: 'Biblioteca y Archivo',
    etiqueta: 'Lic. Jorge Biblioteca (Biblioteca y Archivo)',
  },
  {
    id: 'usr_bienestar',
    nombre: 'Dra. Patricia Valenzuela',
    correo: 'bienestar@sena.edu.co',
    dependenciaSugerida: 'Bienestar al Aprendiz y Comunidad',
    etiqueta: 'Dra. Patricia Valenzuela (Bienestar al Aprendiz)',
  },
]

const nombresDependenciasSugeridas = [
  {
    nombre: 'Gestión Tecnológica (TIC)',
    descripcion: 'Equipos de cómputo, sistemas y accesos digitales',
    icono: 'computer',
    responsableSugerido: 'Ing. Roberto Gómez',
    correoSugerido: 'area.tic@gccon.com',
  },
  {
    nombre: 'Almacén e Inventarios',
    descripcion: 'Herramientas, mobiliario y activos físicos',
    icono: 'inventory_2',
    responsableSugerido: 'Lic. Martha Almacén',
    correoSugerido: 'area.almacen@gccon.com',
  },
  {
    nombre: 'Recursos Humanos / Talento Humano',
    descripcion: 'Carné institucional, aportes y paz y salvo laboral',
    icono: 'badge',
    responsableSugerido: 'Dra. Claudia Ramos',
    correoSugerido: 'rrhh@sena.edu.co',
  },
  {
    nombre: 'Infraestructura y Servicios Generales',
    descripcion: 'Llaves, tarjetas de acceso y espacios físicos',
    icono: 'domain',
    responsableSugerido: 'Ing. Fernando Ramírez',
    correoSugerido: 'infraestructura@sena.edu.co',
  },
  {
    nombre: 'Biblioteca y Archivo',
    descripcion: 'Préstamos bibliográficos y entrega de archivos',
    icono: 'menu_book',
    responsableSugerido: 'Lic. Jorge Biblioteca',
    correoSugerido: 'biblioteca@sena.edu.co',
  },
  {
    nombre: 'Bienestar al Aprendiz y Comunidad',
    descripcion: 'Comunidad educativa y apoyos institucionales',
    icono: 'volunteer_activism',
    responsableSugerido: 'Dra. Patricia Valenzuela',
    correoSugerido: 'bienestar@sena.edu.co',
  },
  {
    nombre: 'Coordinación Académica y Formación',
    descripcion: 'Calificaciones, fichas y reportes formativos',
    icono: 'school',
    responsableSugerido: 'Lic. Martha Almacén',
    correoSugerido: 'area.almacen@gccon.com',
  },
]

const filtroNombresDependencias = ref([...nombresDependenciasSugeridas])

function filtrarNombresDependencias(val, update) {
  if (val === '') {
    update(() => {
      filtroNombresDependencias.value = nombresDependenciasSugeridas
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    filtroNombresDependencias.value = nombresDependenciasSugeridas.filter(
      (v) =>
        v.nombre.toLowerCase().includes(needle) || v.descripcion.toLowerCase().includes(needle),
    )
  })
}

function onSeleccionarNombreDependencia(val) {
  if (!val) return
  const nombreTexto = typeof val === 'object' ? val.nombre : val
  dependencia.value.nombre = nombreTexto

  // Autoseleccionar responsable correspondiente si existe
  const sugerencia = nombresDependenciasSugeridas.find(
    (s) => s.nombre.toLowerCase() === nombreTexto.toLowerCase(),
  )

  if (sugerencia) {
    const respEncontrado = opcionesResponsables.value.find(
      (r) =>
        (r.nombre &&
          sugerencia.responsableSugerido &&
          r.nombre.toLowerCase().includes(sugerencia.responsableSugerido.toLowerCase())) ||
        (r.correo &&
          sugerencia.correoSugerido &&
          r.correo.toLowerCase() === sugerencia.correoSugerido.toLowerCase()),
    )
    if (respEncontrado) {
      responsableSeleccionado.value = respEncontrado
      dependencia.value.responsable = respEncontrado.nombre
      dependencia.value.correo = respEncontrado.correo
      dependencia.value.responsable_id = respEncontrado.id || respEncontrado._id || null
    }
  }
}

const opcionesResponsables = ref([...responsablesPredefinidos])

async function cargarResponsables() {
  try {
    const resp = await api.get('/usuarios?rol=ResponsableArea')
    const lista = Array.isArray(resp.data) ? resp.data : resp.data?.usuarios || []
    if (Array.isArray(lista) && lista.length > 0) {
      const desdeAtlas = lista.map((u) => ({
        id: u._id || u.id,
        _id: u._id || u.id,
        nombre: u.nombre_completo || u.nombre,
        correo: u.correo_institucional || u.correo || '',
        etiqueta: `${u.nombre_completo || u.nombre} (${u.correo_institucional || u.correo || 'Responsable de Área'})`,
      }))
      const mapa = new Map()
      desdeAtlas.forEach((r) => mapa.set(r.correo.toLowerCase(), r))
      responsablesPredefinidos.forEach((r) => {
        if (!mapa.has(r.correo.toLowerCase())) {
          mapa.set(r.correo.toLowerCase(), r)
        }
      })
      opcionesResponsables.value = Array.from(mapa.values())
    } else {
      opcionesResponsables.value = [...responsablesPredefinidos]
    }
  } catch {
    opcionesResponsables.value = [...responsablesPredefinidos]
  }
}

onMounted(() => {
  cargarResponsables()
})

function onSeleccionarResponsable(val) {
  if (!val) return
  if (typeof val === 'object') {
    dependencia.value.responsable = val.nombre || val.etiqueta || ''
    if (val.correo) {
      dependencia.value.correo = val.correo
    }
    dependencia.value.responsable_id = val.id || val._id || null

    if (val.dependenciaSugerida && !dependencia.value.nombre) {
      dependencia.value.nombre = val.dependenciaSugerida
    }
  } else if (typeof val === 'string') {
    dependencia.value.responsable = val
  }
}

const dependenciaSeleccionadaEliminar = ref(null)

const esInactivaSeleccionada = computed(() => {
  const d =
    dependenciaSeleccionadaEliminar.value ||
    store.dependencias.find(
      (item) => item.codigo === codigoEliminar.value || item._id === codigoEliminar.value,
    )
  return d ? d.estado === 'Inactiva' || d.estado === 'Inactivo' : false
})

const nombreEliminar = computed(() => {
  if (dependenciaSeleccionadaEliminar.value) {
    return (
      dependenciaSeleccionadaEliminar.value.nombre ||
      dependenciaSeleccionadaEliminar.value.nombre_dependencia ||
      codigoEliminar.value ||
      'la dependencia'
    )
  }
  const d = store.dependencias.find(
    (item) => item.codigo === codigoEliminar.value || item._id === codigoEliminar.value,
  )
  return d?.nombre || d?.nombre_dependencia || codigoEliminar.value || 'la dependencia'
})

const dependencia = ref({
  codigo: '',
  nombre: '',
  responsable: '',
  responsable_id: null,
  correo: '',
  estado: 'Activa',
})

const columns = [
  {
    name: 'codigo',
    label: 'Código',
    field: 'codigo',
    align: 'left',
    sortable: true,
  },
  {
    name: 'nombre',
    label: 'Dependencia',
    field: 'nombre',
    align: 'left',
    sortable: true,
  },
  {
    name: 'responsable',
    label: 'Responsable de Área',
    field: 'responsable',
    align: 'left',
    sortable: true,
  },
  {
    name: 'correo',
    label: 'Correo Responsable',
    field: 'correo',
    align: 'left',
    sortable: true,
  },
  {
    name: 'estado',
    label: 'Estado',
    field: 'estado',
    align: 'center',
    sortable: true,
  },
  {
    name: 'acciones',
    label: 'Acciones',
    field: 'acciones',
    align: 'center',
  },
]

function guardarDependencia() {
  const existeCodigo = store.dependencias.some((item, index) => {
    return item.codigo === dependencia.value.codigo && index !== indiceEditar.value
  })

  if (existeCodigo) {
    $q.notify({
      type: 'negative',
      message: 'Ya existe una dependencia con ese código.',
    })
    return
  }

  if (editando.value) {
    store.editar(indiceEditar.value, { ...dependencia.value })
    $q.notify({
      type: 'positive',
      message: 'Dependencia y responsable asignados correctamente.',
    })
  } else {
    store.agregar({ ...dependencia.value })
    $q.notify({
      type: 'positive',
      message: 'Dependencia registrada con su responsable de área exitosamente.',
    })
  }

  limpiarFormulario()
}

function nuevaDependencia() {
  limpiarFormulario()
  const siguienteNum = (store.dependencias.length + 1).toString().padStart(2, '0')
  dependencia.value.codigo = `DEP-${siguienteNum}`

  // Ya aparece la Dependencia y el Responsable de Área asignado de inmediato
  if (nombresDependenciasSugeridas.length > 0) {
    const primeraSugerencia = nombresDependenciasSugeridas[0]
    dependencia.value.nombre = primeraSugerencia.nombre
    onSeleccionarNombreDependencia(primeraSugerencia.nombre)
  } else if (opcionesResponsables.value.length > 0) {
    const seleccionado = opcionesResponsables.value[0]
    responsableSeleccionado.value = seleccionado
    dependencia.value.responsable = seleccionado.nombre
    dependencia.value.correo = seleccionado.correo
    dependencia.value.responsable_id = seleccionado.id
  }
  dialogo.value = true
}

function editarDependencia(fila) {
  dependencia.value = { ...fila }
  responsableSeleccionado.value =
    opcionesResponsables.value.find(
      (r) =>
        r.nombre === fila.responsable ||
        r.id === fila.responsable_id ||
        r._id === fila.responsable_id,
    ) || fila.responsable
  indiceEditar.value = store.dependencias.findIndex((item) => item.codigo === fila.codigo)
  editando.value = true
  dialogo.value = true
}

function eliminarDependencia(item) {
  if (typeof item === 'object' && item !== null) {
    dependenciaSeleccionadaEliminar.value = item
    codigoEliminar.value = item.codigo || item._id || ''
  } else {
    codigoEliminar.value = item
    dependenciaSeleccionadaEliminar.value =
      store.dependencias.find((d) => d.codigo === item || d._id === item) || null
  }
  dialogoEliminar.value = true
}

function confirmarEliminar() {
  const eraInactiva = esInactivaSeleccionada.value
  const nombreDep = nombreEliminar.value
  store.eliminar(codigoEliminar.value)
  codigoEliminar.value = ''
  dependenciaSeleccionadaEliminar.value = null
  dialogoEliminar.value = false
  $q.notify({
    type: 'info',
    message: eraInactiva
      ? `Dependencia "${nombreDep}" activada correctamente.`
      : `Dependencia "${nombreDep}" desactivada correctamente.`,
  })
}

function cancelar() {
  limpiarFormulario()
}

function limpiarFormulario() {
  dependencia.value = {
    codigo: '',
    nombre: '',
    responsable: '',
    responsable_id: null,
    correo: '',
    estado: 'Activa',
  }
  responsableSeleccionado.value = null
  dialogo.value = false
  editando.value = false
  indiceEditar.value = null
}
</script>
