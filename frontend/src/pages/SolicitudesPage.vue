<template>
  <q-page class="q-pa-lg">
    <!-- Encabezado -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h4 text-primary text-weight-bold">Solicitudes</div>
        <div class="text-subtitle2 text-grey-7">Gestión de formatos GCCON-F-088</div>
      </div>

      <q-btn
        v-if="esContratista || esAdmin"
        color="positive"
        icon="add"
        label="Nueva Solicitud"
        unelevated
        @click="nuevaSolicitud"
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
        placeholder="Buscar solicitud, contrato, contratista..."
      >
        <template #prepend>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>

    <!-- Tabla de Solicitudes -->
    <q-table
      :title="
        esContratista
          ? 'Mis Solicitudes de Paz y Salvo'
          : esSupervisor
            ? 'Solicitudes bajo mi Supervisión'
            : esResponsableArea
              ? 'Solicitudes en Evaluación / Firma de Dependencias'
              : esAdmin
                ? 'Todas las Solicitudes (Administración)'
                : 'Listado de Solicitudes Paz y Salvo'
      "
      :rows="rows"
      :columns="columns"
      :filter="filtro"
      :filter-method="metodoFiltro"
      row-key="id"
      flat
      bordered
      :loading="store.cargando"
      :rows-per-page-options="[10, 25, 50, 0]"
      :pagination="{ rowsPerPage: 25 }"
      no-data-label="No hay solicitudes registradas"
      no-results-label="No se encontraron coincidencias"
    >
      <!-- Badge de Estado -->
      <template #body-cell-estado="props">
        <q-td :props="props" class="text-center">
          <div class="column items-center q-gutter-xs">
            <q-badge :color="obtenerColorEstado(props.row.estado)" class="q-pa-xs text-weight-bold">
              {{ props.row.estado || 'Pendiente' }}
            </q-badge>

            <!-- Si está Rechazado / Con Novedad -->
            <template v-if="props.row.estado === 'Rechazado'">
              <!-- Si hay 1 sola área con novedad: píldora pequeña y elegante -->
              <q-chip
                v-if="obtenerNovedadesFila(props.row).length <= 1"
                dense
                size="xs"
                color="red-1"
                text-color="negative"
                icon="warning"
                class="cursor-pointer q-ma-none text-weight-medium"
                clickable
                @click.stop="abrirModalNovedades(props.row)"
              >
                {{
                  obtenerNovedadesFila(props.row)[0]?.dependencia ||
                  props.row.dependencia ||
                  '1 Novedad'
                }}
                <q-tooltip class="bg-grey-9 text-caption">
                  {{
                    obtenerNovedadesFila(props.row)[0]?.motivo ||
                    props.row.observacionRechazo ||
                    'Clic para ver detalle de la novedad'
                  }}
                </q-tooltip>
              </q-chip>

              <!-- Si hay 2 o más áreas: se resume limpiamente sin amontonar la tabla -->
              <q-chip
                v-else
                dense
                size="xs"
                color="red-2"
                text-color="negative"
                icon="report_problem"
                class="cursor-pointer q-ma-none text-weight-bold"
                clickable
                @click.stop="abrirModalNovedades(props.row)"
              >
                {{ obtenerNovedadesFila(props.row).length }} áreas pendientes
                <q-tooltip class="bg-grey-9 text-caption">
                  <div class="text-weight-bold text-negative q-mb-xs">
                    Áreas con novedades pendientes:
                  </div>
                  <div v-for="(nov, i) in obtenerNovedadesFila(props.row)" :key="i">
                    • <strong>{{ nov.dependencia }}:</strong> {{ nov.motivo }}
                  </div>
                  <div class="text-caption text-italic q-mt-xs text-amber-3">
                    Clic para abrir detalle
                  </div>
                </q-tooltip>
              </q-chip>
            </template>
          </div>
        </q-td>
      </template>

      <!-- Columna de Acciones -->
      <template #body-cell-acciones="props">
        <q-td :props="props" class="q-gutter-xs text-center">
          <q-btn
            v-if="puedeFirmar"
            flat
            round
            dense
            :color="props.row.estado === 'Rechazado' ? 'grey-6' : 'positive'"
            :icon="props.row.estado === 'Rechazado' ? 'block' : 'draw'"
            @click="irAFirmar(props.row)"
          >
            <q-tooltip>{{
              props.row.estado === 'Rechazado'
                ? 'Firma bloqueada: Solicitud rechazada por novedades'
                : 'Firmar / Pegar Firma'
            }}</q-tooltip>
          </q-btn>

          <q-btn
            flat
            round
            dense
            color="red-7"
            icon="picture_as_pdf"
            @click="verCertificado(props.row)"
          >
            <q-tooltip>Ver Certificado PDF</q-tooltip>
          </q-btn>

          <q-btn flat round dense color="primary" icon="edit" @click="editarSolicitud(props.row)">
            <q-tooltip>Editar</q-tooltip>
          </q-btn>

          <!-- Acción de Estado (Reactivar si está Rechazado, Desactivar / Rechazar si está en Revisión/Firmado) -->
          <q-btn
            v-if="props.row.estado === 'Rechazado'"
            flat
            round
            dense
            color="positive"
            icon="replay"
            @click="abrirDialogoEstado(props.row, 'En revisión')"
          >
            <q-tooltip>Reactivar / Enviar a Revisión</q-tooltip>
          </q-btn>
          <q-btn
            v-else
            flat
            round
            dense
            color="negative"
            icon="block"
            @click="abrirDialogoEstado(props.row, 'Rechazado')"
          >
            <q-tooltip>Desactivar / Rechazar</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <!-- Diálogo Formulario -->
    <q-dialog v-model="dialogo" persistent>
      <q-card style="min-width: 550px; max-width: 90vw">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6 text-primary text-weight-bold">
            {{ editando ? 'Editar Solicitud' : 'Nueva Solicitud' }}
          </div>
          <q-btn icon="close" flat round dense v-close-popup @click="cancelar" />
        </q-card-section>

        <q-separator />

        <q-form ref="formRef" @submit.prevent="guardarSolicitud">
          <q-card-section class="q-gutter-y-sm">
            <!-- Número de Solicitud (Consecutivo automático institucional) -->
            <q-input
              outlined
              dense
              v-model="solicitud.numeroSolicitud"
              label="Número de Radicado / Solicitud *"
              readonly
              hint="Radicado oficial generado automáticamente por el sistema"
              :rules="[(val) => !!val || 'El número de solicitud es obligatorio']"
            >
              <template #prepend>
                <q-icon name="tag" color="grey-7" />
              </template>
            </q-input>

            <!-- Contratista (Selección del catálogo de contratistas supervisados) -->
            <q-select
              outlined
              dense
              v-model="solicitud.contratista"
              label="Contratista *"
              :options="opcionesContratistas"
              option-label="etiqueta"
              option-value="nombre"
              emit-value
              map-options
              use-input
              fill-input
              hide-selected
              input-debounce="0"
              new-value-mode="add-unique"
              @update:model-value="onSeleccionarContratista"
              :rules="[(val) => !!val || 'El nombre del contratista es obligatorio']"
              hint="Seleccione un contratista registrado o ingrese uno nuevo"
            >
              <template #prepend>
                <q-icon name="person" color="primary" />
              </template>
            </q-select>

            <!-- Número de Contrato (Vinculado al contratista seleccionado) -->
            <q-input
              outlined
              dense
              v-model="solicitud.numeroContrato"
              label="Número de Contrato *"
              :rules="[(val) => !!val || 'El número de contrato es obligatorio']"
              hint="Contrato oficial asignado al contratista por la supervisión"
            >
              <template #prepend>
                <q-icon name="description" color="primary" />
              </template>
            </q-input>

            <!-- Dependencia -->
            <q-select
              outlined
              dense
              v-model="solicitud.dependencia"
              label="Dependencia *"
              :options="opcionesDependencias"
              option-label="nombre"
              option-value="nombre"
              emit-value
              map-options
              use-input
              fill-input
              hide-selected
              input-debounce="0"
              new-value-mode="add-unique"
              @update:model-value="onSeleccionarDependencia"
              :rules="[(val) => !!val || 'La dependencia es obligatoria']"
              hint="Área institucional que validará bienes y paz y salvo"
            >
              <template #prepend>
                <q-icon name="business" color="primary" />
              </template>
            </q-select>

            <!-- Responsable de Área -->
            <q-input
              outlined
              dense
              v-model="solicitud.responsable"
              label="Responsable de Área Asignado *"
              :rules="[(val) => !!val || 'El responsable es obligatorio']"
              hint="Funcionario al que va dirigida la solicitud para firma"
            >
              <template #prepend>
                <q-icon name="badge" color="primary" />
              </template>
            </q-input>

            <q-input
              outlined
              dense
              type="date"
              v-model="solicitud.fecha"
              label="Fecha *"
              stack-label
              :rules="[(val) => !!val || 'La fecha es obligatoria']"
            />

            <q-select
              outlined
              dense
              v-model="solicitud.estado"
              :options="OPCIONES_ESTADO"
              label="Estado"
            />

            <!-- Buzón de Observaciones de Rechazo si el estado es Rechazado -->
            <q-input
              v-if="solicitud.estado === 'Rechazado'"
              v-model="solicitud.observacionRechazo"
              outlined
              dense
              type="textarea"
              rows="3"
              label="Buzón de Observaciones de Rechazo / Novedades pendientes *"
              placeholder="Escriba con exactitud los motivos del rechazo, bienes faltantes o requisitos pendientes por subsanar..."
              class="q-mt-sm"
              :rules="[(val) => !!val || 'El motivo de rechazo es obligatorio']"
            >
              <template #prepend>
                <q-icon name="comment" color="negative" />
              </template>
            </q-input>
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat label="Cancelar" color="grey-8" @click="cancelar" />
            <q-btn unelevated type="submit" color="positive" label="Guardar" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Diálogo Confirmar Cambio de Estado (Desactivar / Rechazar o Reactivar) -->
    <q-dialog v-model="dialogoEstado">
      <q-card style="min-width: 420px; max-width: 90vw">
        <q-card-section class="row items-center">
          <q-avatar
            :icon="nuevoEstadoObjetivo === 'Rechazado' ? 'block' : 'replay'"
            :color="nuevoEstadoObjetivo === 'Rechazado' ? 'negative' : 'positive'"
            text-color="white"
            class="q-mr-sm"
          />
          <span class="text-h6 text-weight-bold">
            {{
              nuevoEstadoObjetivo === 'Rechazado'
                ? 'Desactivar / Rechazar Solicitud'
                : 'Reactivar Solicitud'
            }}
          </span>
        </q-card-section>

        <q-card-section class="q-pt-none text-body2">
          <div v-if="nuevoEstadoObjetivo === 'Rechazado'">
            <p>
              ¿Está seguro de desactivar o rechazar la solicitud
              <strong>{{
                solicitudSeleccionada?.numeroSolicitud || solicitudSeleccionada?.numeroContrato
              }}</strong
              >?
            </p>
            <p class="text-grey-8">
              El estado de la solicitud cambiará inmediatamente a
              <q-badge color="negative" class="text-weight-bold">Rechazado</q-badge>.
            </p>
            <q-input
              v-model="motivoEstado"
              outlined
              dense
              type="textarea"
              rows="2"
              label="Motivo u observación (opcional)"
              placeholder="Ej: Documentación incompleta o solicitud cancelada"
              class="q-mt-sm"
            />
          </div>
          <div v-else>
            <p>
              ¿Desea reactivar la solicitud
              <strong>{{
                solicitudSeleccionada?.numeroSolicitud || solicitudSeleccionada?.numeroContrato
              }}</strong
              >?
            </p>
            <p class="text-grey-8">
              El estado volverá a
              <q-badge color="primary" class="text-weight-bold">En revisión</q-badge>
              para continuar con el proceso.
            </p>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" color="grey-8" v-close-popup />
          <q-btn
            unelevated
            :color="nuevoEstadoObjetivo === 'Rechazado' ? 'negative' : 'positive'"
            :label="nuevoEstadoObjetivo === 'Rechazado' ? 'Desactivar / Rechazar' : 'Reactivar'"
            @click="confirmarCambioEstado"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Diálogo Detalle de Novedades por Dependencia (Multi-Área) -->
    <q-dialog v-model="dialogoNovedades">
      <q-card style="min-width: 480px; max-width: 95vw" class="rounded-borders">
        <q-card-section class="row items-center bg-red-1 text-negative q-py-sm">
          <q-avatar
            icon="report_problem"
            color="negative"
            text-color="white"
            size="md"
            class="q-mr-sm"
          />
          <div>
            <div class="text-subtitle1 text-weight-bold">
              Novedades Reportadas por Dependencia ({{ novedadesSeleccionadas.length }})
            </div>
            <div class="text-caption text-grey-8">
              {{
                solicitudSeleccionadaNovedad?.numeroSolicitud ||
                solicitudSeleccionadaNovedad?.numeroContrato
              }}
              — {{ solicitudSeleccionadaNovedad?.contratista }}
            </div>
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-md">
          <q-banner rounded dense class="bg-amber-1 text-brown-9 q-mb-md border-amber">
            <template #avatar>
              <q-icon name="info" color="warning" />
            </template>
            <div class="text-caption">
              <strong>Procedimiento de Subsanación:</strong> El contratista solo debe acudir a las
              dependencias relacionadas a continuación para subsanar los requerimientos. Las
              aprobaciones y firmas de las demás áreas permanecen intactas y válidas.
            </div>
          </q-banner>

          <q-list bordered separator class="rounded-borders">
            <q-item v-for="(nov, idx) in novedadesSeleccionadas" :key="idx" class="q-py-md">
              <q-item-section avatar top>
                <q-avatar color="red-1" text-color="negative" icon="apartment" />
              </q-item-section>
              <q-item-section>
                <div class="row items-center justify-between">
                  <span class="text-subtitle2 text-weight-bold text-dark">{{
                    nov.dependencia
                  }}</span>
                  <q-badge color="negative" class="text-weight-bold q-px-xs"
                    >Pendiente de Subsanar</q-badge
                  >
                </div>
                <div class="text-body2 text-grey-9 q-mt-xs">
                  <strong>Novedad / Observación:</strong> {{ nov.motivo }}
                </div>
                <div v-if="nov.responsable" class="text-caption text-grey-7 q-mt-xs">
                  Responsable a cargo: {{ nov.responsable }}
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md bg-grey-1">
          <q-btn flat label="Cerrar" color="grey-8" v-close-popup />
          <q-btn
            unelevated
            color="primary"
            icon="picture_as_pdf"
            label="Ver Certificado GCCON-F-088"
            @click="verCertificado(solicitudSeleccionadaNovedad)"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useSolicitudesStore } from '../stores/useSolicitudesStore.js'
import { useContratistasStore } from '../stores/useContratistasStore.js'
import { useDependenciasStore } from '../stores/useDependenciasStore.js'
import { useAuthStore } from '../stores/authStore.js'

const $q = useQuasar()
const router = useRouter()
const store = useSolicitudesStore()
const contratistasStore = useContratistasStore()
const dependenciasStore = useDependenciasStore()
const auth = useAuthStore()

onMounted(async () => {
  if (store.cargarSolicitudes) {
    store.cargarSolicitudes()
  }
  if (contratistasStore.cargarContratistas) {
    await contratistasStore.cargarContratistas()
  }
  if (dependenciasStore.cargarDependencias) {
    await dependenciasStore.cargarDependencias()
  }
})

const opcionesContratistas = computed(() => {
  return (contratistasStore.contratistas || []).map((c) => ({
    nombre: c.nombre,
    numeroContrato: c.numeroContrato || '',
    etiqueta: `${c.nombre} (${c.numeroContrato || 'Sin contrato'})`,
  }))
})

function onSeleccionarContratista(val) {
  if (!val) return
  const nombreContratista = typeof val === 'object' ? val.nombre : val
  solicitud.value.contratista = nombreContratista

  const encontrado = (contratistasStore.contratistas || []).find(
    (c) => c.nombre.toLowerCase().trim() === String(nombreContratista).toLowerCase().trim(),
  )
  if (encontrado) {
    if (encontrado.documento) {
      solicitud.value.documentoContratista = encontrado.documento
      solicitud.value.identificacion = encontrado.documento
    }
    if (encontrado.numeroContrato) {
      solicitud.value.numeroContrato = encontrado.numeroContrato
    }
    // Si no es un supervisor imponiendo su área, cargar la dependencia y supervisor por defecto del contratista
    if (auth.rolUsuario !== 'SUPERVISOR') {
      if (encontrado.dependencia) {
        solicitud.value.dependencia = encontrado.dependencia
      }
      if (encontrado.supervisor) {
        solicitud.value.responsable = encontrado.supervisor
      }
    }
  } else if (typeof val === 'object' && val.numeroContrato) {
    solicitud.value.numeroContrato = val.numeroContrato
  }
}

const opcionesDependencias = computed(() => {
  return (dependenciasStore.dependencias || [])
    .filter((d) => d.estado !== 'Inactiva')
    .map((d) => ({
      nombre: d.nombre,
      responsable: d.responsable,
      correo: d.correo,
    }))
})

function onSeleccionarDependencia(val) {
  if (!val) return
  if (typeof val === 'object') {
    solicitud.value.dependencia = val.nombre
    if (val.responsable) {
      solicitud.value.responsable = val.responsable
    }
  } else if (typeof val === 'string') {
    solicitud.value.dependencia = val
    const encontrada = dependenciasStore.dependencias.find(
      (d) => d.nombre.toLowerCase().trim() === val.toLowerCase().trim(),
    )
    if (encontrada?.responsable) {
      solicitud.value.responsable = encontrada.responsable
    }
  }
}

const puedeFirmar = computed(() => auth.tienePermiso(['RESPONSABLE_AREA']))

const esContratista = computed(() => auth.tienePermiso(['CONTRATISTA']))
const esSupervisor = computed(() => auth.tienePermiso(['SUPERVISOR']))
const esResponsableArea = computed(() => auth.tienePermiso(['RESPONSABLE_AREA']))
const esAdmin = computed(() => auth.tienePermiso(['ADMINISTRADOR']))

function normalizarTexto(txt) {
  return (txt || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

const OPCIONES_ESTADO = ['En revisión', 'Firmado', 'Rechazado', 'Finalizado']

const formRef = ref(null)
const filtro = ref('')
const dialogo = ref(false)
const dialogoEstado = ref(false)

const editando = ref(false)
const codigoEditar = ref(null)
const solicitudSeleccionada = ref(null)
const nuevoEstadoObjetivo = ref('')
const motivoEstado = ref('')
const dialogoNovedades = ref(false)
const solicitudSeleccionadaNovedad = ref(null)
const novedadesSeleccionadas = ref([])

function obtenerNovedadesFila(fila) {
  if (!fila) return []
  if (Array.isArray(fila.novedades) && fila.novedades.length > 0) {
    return fila.novedades
  }
  if (Array.isArray(fila.firmas)) {
    const rechazadas = fila.firmas.filter((f) => f.estado === 'Rechazado' || f.rechazada)
    if (rechazadas.length > 0) {
      return rechazadas.map((f) => ({
        dependencia: f.dependenciaNombre || f.dependencia || 'Área',
        motivo:
          f.observacion ||
          f.motivo ||
          fila.observacionRechazo ||
          'Requerimiento pendiente de entrega',
        responsable: f.responsable || '',
      }))
    }
  }
  if (Array.isArray(fila.dependenciasRechazo) && fila.dependenciasRechazo.length > 0) {
    return fila.dependenciasRechazo.map((d) =>
      typeof d === 'string'
        ? {
            dependencia: d,
            motivo: fila.observacionRechazo || 'Requerimiento pendiente de entrega',
            responsable: '',
          }
        : d,
    )
  }
  if (fila.dependenciaRechazo || (fila.estado === 'Rechazado' && fila.observacionRechazo)) {
    return [
      {
        dependencia: fila.dependenciaRechazo || fila.dependencia || 'Área Evaluadora',
        motivo:
          fila.observacionRechazo ||
          fila.observaciones_supervisor ||
          'Requerimiento o bienes pendientes de entrega',
        responsable: fila.responsable || '',
      },
    ]
  }
  return []
}

function abrirModalNovedades(fila) {
  solicitudSeleccionadaNovedad.value = fila
  novedadesSeleccionadas.value = obtenerNovedadesFila(fila)
  dialogoNovedades.value = true
}

const rows = computed(() => {
  const lista = store.solicitudes || []
  if (!auth.usuario) return lista

  const rol = (auth.rolUsuario || '').toUpperCase()

  // 1. Si es CONTRATISTA: Solo debe ver sus propias solicitudes
  if (rol === 'CONTRATISTA') {
    const u = auth.usuario
    const miNombre = normalizarTexto(u.nombre || u.nombre_completo)
    const miDocumento = String(u.documento || u.identificacion || '').trim()
    const miCorreo = normalizarTexto(u.correo || u.correo_institucional)
    const miContrato = normalizarTexto(u.numeroContrato || u.contrato)
    const miId = String(u.id || u._id || '').trim()

    return lista.filter((s) => {
      const nom = normalizarTexto(s.contratista || s.nombreContratista)
      const doc = String(s.documentoContratista || s.identificacion || s.documento || '').trim()
      const cor = normalizarTexto(s.correo || s.correoContratista)
      const con = normalizarTexto(s.numeroContrato || s.contrato)
      const conId = String(s.contratista_id || s.usuario_id || s.usuario?._id || '').trim()

      if (miDocumento && doc && miDocumento === doc) return true
      if (miId && conId && miId === conId) return true
      if (miCorreo && cor && miCorreo === cor) return true
      if (miContrato && con && (miContrato === con || con.includes(miContrato))) return true
      if (miNombre && nom && (nom.includes(miNombre) || miNombre.includes(nom))) return true

      return false
    })
  }

  // 2. Si es SUPERVISOR: Solo debe ver las solicitudes asignadas a su supervisión
  if (rol === 'SUPERVISOR') {
    const u = auth.usuario
    const miNombre = normalizarTexto(u.nombre || u.nombre_completo)
    const miCorreo = normalizarTexto(u.correo || u.correo_institucional)
    const miDep = normalizarTexto(u.dependencia)

    return lista.filter((s) => {
      const resp = normalizarTexto(s.responsable || s.supervisor)
      const dep = normalizarTexto(s.dependencia)
      const cor = normalizarTexto(s.correoSupervisor || s.correo_supervisor)

      if (miNombre && resp && (resp.includes(miNombre) || miNombre.includes(resp))) return true
      if (miCorreo && cor && miCorreo === cor) return true
      if (miDep && dep && (dep.includes(miDep) || miDep.includes(dep))) return true

      return false
    })
  }

  // 3. Si es RESPONSABLE_AREA: ve solicitudes de su área / pendientes de firma
  if (rol === 'RESPONSABLE_AREA') {
    const u = auth.usuario
    const miDep = normalizarTexto(u.dependencia)
    if (miDep) {
      const filtradas = lista.filter((s) => {
        const dep = normalizarTexto(s.dependencia)
        if (dep && (dep.includes(miDep) || miDep.includes(dep))) return true
        if (Array.isArray(s.firmas)) {
          return s.firmas.some((f) => {
            const nomF = normalizarTexto(f.dependenciaNombre || f.dependencia)
            return nomF && (nomF.includes(miDep) || miDep.includes(nomF))
          })
        }
        return false
      })
      if (filtradas.length > 0) return filtradas
    }
    return lista
  }

  // 4. Si es ADMINISTRADOR: ve todas las solicitudes
  return lista
})

const solicitud = ref({
  numeroSolicitud: '',
  numeroContrato: '',
  contratista: '',
  dependencia: '',
  responsable: '',
  fecha: new Date().toISOString().substring(0, 10),
  estado: 'En revisión',
  observacionRechazo: '',
})

const columns = [
  {
    name: 'numeroSolicitud',
    label: 'Solicitud',
    field: (row) => row.numeroSolicitud || row.solicitud || row.codigo || row.id || 'N/A',
    align: 'left',
    sortable: true,
  },
  {
    name: 'numeroContrato',
    label: 'Contrato',
    field: (row) => row.numeroContrato || row.contrato || 'N/A',
    align: 'left',
    sortable: true,
  },
  {
    name: 'contratista',
    label: 'Contratista',
    field: (row) => row.contratista || row.nombreContratista || 'N/A',
    align: 'left',
    sortable: true,
  },
  {
    name: 'dependencia',
    label: 'Dependencia',
    field: (row) => row.dependencia || row.nombreDependencia || 'N/A',
    align: 'left',
    sortable: true,
  },
  {
    name: 'estado',
    label: 'Estado',
    field: (row) => row.estado || 'Pendiente',
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

function metodoFiltro(filas, termino) {
  const t = (termino || '').toLowerCase().trim()
  if (!t) return filas
  return filas.filter((r) => {
    const texto = [
      r.numeroSolicitud,
      r.solicitud,
      r.codigo,
      r.id,
      r.numeroContrato,
      r.contrato,
      r.contratista,
      r.nombreContratista,
      r.dependencia,
      r.responsable,
      r.documentoContratista,
      r.estado,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return texto.includes(t)
  })
}

function obtenerColorEstado(estado) {
  switch (estado) {
    case 'Pendiente':
      return 'warning'
    case 'En revisión':
      return 'primary'
    case 'Firmado':
      return 'positive'
    case 'Finalizado':
      return 'teal'
    case 'Rechazado':
      return 'negative'
    default:
      return 'warning'
  }
}

function irAFirmar(fila) {
  if (!auth.tienePermiso(['RESPONSABLE_AREA'])) {
    $q.notify({
      type: 'warning',
      message:
        'La evaluación y firma de dependencias está reservada exclusivamente para los Responsables de Área.',
      icon: 'lock',
    })
    return
  }
  if (fila.estado === 'Rechazado') {
    $q.dialog({
      title: 'Firma No Habilitada',
      message: `Esta solicitud se encuentra en estado RECHAZADO por las dependencias.

Motivo: "${fila.observacionRechazo || fila.observaciones_supervisor || 'Presenta novedades o bienes pendientes por subsanar.'}"

¿Desea ingresar a la pantalla de detalle para revisar las observaciones reportadas?`,
      color: 'negative',
      icon: 'block',
      ok: {
        label: 'Ver detalle y novedades',
        color: 'negative',
        unelevated: true,
      },
      cancel: {
        label: 'Cerrar',
        flat: true,
        color: 'grey-8',
      },
    }).onOk(() => {
      const codigo =
        fila.numeroSolicitud ||
        fila.solicitud ||
        fila.codigo ||
        fila.numeroContrato ||
        fila.contrato
      router.push({
        name: 'firmas',
        query: { codigo: codigo },
      })
    })
    return
  }
  const codigo =
    fila.numeroSolicitud || fila.solicitud || fila.codigo || fila.numeroContrato || fila.contrato
  router.push({
    name: 'firmas',
    query: { codigo: codigo },
  })
}

function verCertificado(fila) {
  const codigo =
    fila.numeroSolicitud || fila.solicitud || fila.codigo || fila.numeroContrato || fila.contrato

  if (codigo) {
    const numCon =
      fila.numeroContrato ||
      (fila.contrato && !fila.contrato.includes('/') ? fila.contrato : 'CNT-2026-001')
    const fchCon =
      fila.fechaContrato ||
      (fila.contrato && fila.contrato.includes('/') ? fila.contrato : '18/09/2026')

    let iden =
      fila.identificacion ||
      (fila.documentoContratista && fila.documentoContratista !== '—'
        ? fila.documentoContratista
        : '') ||
      (fila.documento && fila.documento !== '—' ? fila.documento : '') ||
      ''

    const nomCont = (fila.contratista || fila.nombreContratista || '').trim().toLowerCase()
    if (!iden || iden === '—') {
      const cMatch = contratistasStore.contratistas?.find(
        (c) => (c.nombre || '').trim().toLowerCase() === nomCont,
      )
      if (cMatch?.documento) {
        iden = cMatch.documento
      } else if (
        auth.usuario?.documento &&
        (auth.rolUsuario === 'CONTRATISTA' ||
          (auth.usuario?.nombre || '').trim().toLowerCase() === nomCont)
      ) {
        iden = auth.usuario.documento
      } else if (auth.usuario?.identificacion) {
        iden = auth.usuario.identificacion
      }
    }

    const datosParaPdf = {
      contratista: fila.contratista || fila.nombreContratista || '',
      identificacion: iden,
      ciudad: !fila.ciudad || fila.ciudad === 'Ibagué' ? 'San Gil' : fila.ciudad,
      regional: !fila.regional || fila.regional === 'Tolima' ? 'Santander' : fila.regional,
      fecha: fila.fecha || new Date().toLocaleDateString('es-CO'),
      direccion: (fila.direccion || fila.dependencia || 'Bienestar al Aprendiz').replace(
        /\s*\/\s*Contratista/i,
        '',
      ),
      numeroContrato: numCon,
      fechaContrato: fchCon,
      contrato: `${numCon} — ${fchCon}`,
      causalTerminacion: fila.causalTerminacion || 'LIQUIDACION_MUTUO_ACUERDO',
      clasificacion: fila.clasificacion || 'Publica',
      responsable: fila.responsable || fila.supervisor || 'Ing. Carlos Supervisor',
      estado: fila.estado || 'En revisión',
      observacionRechazo: fila.observacionRechazo || fila.observaciones_supervisor || '',
    }
    localStorage.setItem(`certificado_datos_${codigo}`, JSON.stringify(datosParaPdf))
    if (datosParaPdf.identificacion) {
      localStorage.setItem(`certificado_identificacion_${codigo}`, datosParaPdf.identificacion)
    }
    if (fila.contratista) {
      localStorage.setItem(
        `certificado_datos_${fila.contratista.toLowerCase().trim()}`,
        JSON.stringify(datosParaPdf),
      )
      if (datosParaPdf.identificacion) {
        localStorage.setItem(
          `certificado_identificacion_${fila.contratista.toLowerCase().trim()}`,
          datosParaPdf.identificacion,
        )
      }
    }
    if (datosParaPdf.identificacion) {
      localStorage.setItem(
        `certificado_datos_${datosParaPdf.identificacion.trim()}`,
        JSON.stringify(datosParaPdf),
      )
    }
  }

  router.push({
    name: 'certificado-pdf',
    query: { codigo: codigo },
  })
}

async function guardarSolicitud() {
  if (formRef.value) {
    const esValido = await formRef.value.validate()
    if (!esValido) return
  }

  if (editando.value) {
    const idBusqueda = codigoEditar.value

    if (typeof store.actualizarSolicitud === 'function') {
      await store.actualizarSolicitud(idBusqueda, { ...solicitud.value })
    }

    if (Array.isArray(store.solicitudes)) {
      const index = store.solicitudes.findIndex(
        (s) =>
          (s._id ||
            s.numeroSolicitud ||
            s.solicitud ||
            s.codigo ||
            s.numeroContrato ||
            s.contrato ||
            s.id) === idBusqueda,
      )
      if (index !== -1) {
        store.solicitudes[index] = {
          ...store.solicitudes[index],
          ...solicitud.value,
          numeroSolicitud:
            solicitud.value.numeroSolicitud ||
            store.solicitudes[index].numeroSolicitud ||
            store.solicitudes[index].solicitud,
        }
      }
    }
    $q.notify({ type: 'positive', message: 'Solicitud y estado actualizados correctamente.' })
    limpiarFormulario()
  } else {
    try {
      if (typeof store.agregarSolicitud === 'function') {
        await store.agregarSolicitud({ ...solicitud.value })
      } else if (Array.isArray(store.solicitudes)) {
        store.solicitudes.push({ ...solicitud.value })
      }
      $q.notify({
        type: 'positive',
        message: 'Solicitud registrada correctamente en MongoDB Atlas.',
      })
      limpiarFormulario()
    } catch (err) {
      $q.notify({
        type: 'negative',
        message: 'Error al registrar solicitud: ' + (err.message || ''),
      })
    }
  }
}

function editarSolicitud(fila) {
  const codigoExistente =
    fila._id ||
    fila.numeroSolicitud ||
    fila.solicitud ||
    fila.codigo ||
    fila.numeroContrato ||
    fila.contrato ||
    ''

  solicitud.value = {
    _id: fila._id,
    numeroSolicitud: fila.numeroSolicitud || fila.solicitud || fila.codigo || codigoExistente,
    numeroContrato: fila.numeroContrato || fila.contrato || '',
    contratista: fila.contratista || fila.nombreContratista || '',
    identificacion: fila.identificacion || fila.documentoContratista || fila.documento || '',
    ciudad: !fila.ciudad || fila.ciudad === 'Ibagué' ? 'San Gil' : fila.ciudad,
    regional: !fila.regional || fila.regional === 'Tolima' ? 'Santander' : fila.regional,
    direccion: (fila.direccion || fila.dependencia || fila.nombreDependencia || '').replace(
      /\s*\/\s*Contratista/i,
      '',
    ),
    fechaContrato:
      fila.fechaContrato ||
      (fila.contrato && fila.contrato.includes('/') ? fila.contrato : '18/09/2026'),
    causalTerminacion: fila.causalTerminacion || 'LIQUIDACION_MUTUO_ACUERDO',
    clasificacion: fila.clasificacion || 'Publica',
    dependencia: fila.dependencia || fila.nombreDependencia || '',
    responsable: fila.responsable || fila.supervisor || '',
    fecha: fila.fecha || new Date().toISOString().substring(0, 10),
    estado: fila.estado || 'En revisión',
    observacionRechazo: fila.observacionRechazo || fila.observaciones_supervisor || '',
  }

  codigoEditar.value = codigoExistente
  editando.value = true
  dialogo.value = true
}

function abrirDialogoEstado(fila, estadoObjetivo) {
  solicitudSeleccionada.value = fila
  nuevoEstadoObjetivo.value = estadoObjetivo
  motivoEstado.value = ''
  dialogoEstado.value = true
}

async function confirmarCambioEstado() {
  if (solicitudSeleccionada.value) {
    const id =
      solicitudSeleccionada.value._id ||
      solicitudSeleccionada.value.numeroContrato ||
      solicitudSeleccionada.value.numeroSolicitud ||
      solicitudSeleccionada.value.id ||
      solicitudSeleccionada.value.solicitud

    const estadoFinal = nuevoEstadoObjetivo.value
    await store.cambiarEstado(id, estadoFinal, motivoEstado.value)

    $q.notify({
      type: estadoFinal === 'Rechazado' ? 'warning' : 'positive',
      message: `Solicitud actualizada a estado "${estadoFinal}" exitosamente.`,
    })
  }
  dialogoEstado.value = false
  solicitudSeleccionada.value = null
}

function nuevaSolicitud() {
  limpiarFormulario()
  const randomSuffix = Math.floor(100 + Math.random() * 900)
  solicitud.value.numeroSolicitud = `SOL-2026-${randomSuffix}`

  if (auth.rolUsuario === 'SUPERVISOR') {
    // Si el usuario autenticado es Supervisor, asignar por defecto su dependencia y a él como responsable
    const miNombre = auth.usuario?.nombre || 'Ing. Carlos Supervisor'
    const miDep = auth.usuario?.dependencia || 'Gestión Tecnológica (TIC)'
    solicitud.value.dependencia = miDep
    solicitud.value.responsable = miNombre

    // Preseleccionar primer contratista supervisado por él o el primero de la lista
    const contratistaACargo =
      (contratistasStore.contratistas || []).find(
        (c) =>
          (c.supervisor || '').toLowerCase().includes(miNombre.toLowerCase()) ||
          miNombre.toLowerCase().includes((c.supervisor || '').toLowerCase()),
      ) || (contratistasStore.contratistas || [])[0]

    if (contratistaACargo) {
      solicitud.value.contratista = contratistaACargo.nombre
      solicitud.value.numeroContrato =
        contratistaACargo.numeroContrato || `CNT-2026-${randomSuffix}`
    } else {
      solicitud.value.numeroContrato = `CNT-2026-${randomSuffix}`
    }
  } else if (auth.rolUsuario === 'CONTRATISTA' && auth.usuario?.nombre) {
    // Si el usuario autenticado es Contratista, autoasignar sus datos y contrato
    const miNombre = auth.usuario.nombre
    solicitud.value.contratista = miNombre
    const encontrado = (contratistasStore.contratistas || []).find(
      (c) =>
        c.nombre.toLowerCase().includes(miNombre.toLowerCase()) ||
        miNombre.toLowerCase().includes(c.nombre.toLowerCase()),
    )
    solicitud.value.numeroContrato =
      encontrado?.numeroContrato || auth.usuario?.numero_contrato || `CNT-2026-${randomSuffix}`

    if (encontrado?.dependencia) {
      solicitud.value.dependencia = encontrado.dependencia
      solicitud.value.responsable = encontrado.supervisor || 'Ing. Carlos Supervisor'
    } else if (dependenciasStore.dependencias.length > 0) {
      const primeraDep =
        dependenciasStore.dependencias.find((d) => d.estado !== 'Inactiva') ||
        dependenciasStore.dependencias[0]
      solicitud.value.dependencia = primeraDep.nombre
      solicitud.value.responsable = primeraDep.responsable
    }
  } else {
    // Si es Administrador creando, vincular al primer contratista y autoasignar su supervisor y dependencia por defecto
    if (contratistasStore.contratistas.length > 0) {
      const primerContratista = contratistasStore.contratistas[0]
      solicitud.value.contratista = primerContratista.nombre
      solicitud.value.numeroContrato =
        primerContratista.numeroContrato || `CNT-2026-${randomSuffix}`
      solicitud.value.dependencia = primerContratista.dependencia || 'Gestión Tecnológica (TIC)'
      solicitud.value.responsable = primerContratista.supervisor || 'Ing. Carlos Supervisor'
    } else {
      solicitud.value.numeroContrato = `CNT-2026-${randomSuffix}`
      if (dependenciasStore.dependencias.length > 0) {
        const primeraDep =
          dependenciasStore.dependencias.find((d) => d.estado !== 'Inactiva') ||
          dependenciasStore.dependencias[0]
        solicitud.value.dependencia = primeraDep.nombre
        solicitud.value.responsable = primeraDep.responsable
      }
    }
  }

  solicitud.value.estado = 'En revisión'
  dialogo.value = true
}

function cancelar() {
  limpiarFormulario()
}

function limpiarFormulario() {
  solicitud.value = {
    numeroSolicitud: '',
    numeroContrato: '',
    contratista: '',
    dependencia: '',
    responsable: '',
    fecha: new Date().toISOString().substring(0, 10),
    estado: 'En revisión',
    observacionRechazo: '',
  }
  dialogo.value = false
  editando.value = false
  codigoEditar.value = null
  if (formRef.value) {
    formRef.value.resetValidation()
  }
}
</script>

<style scoped>
.banner {
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 8px;
  padding: 14px 18px;
  font-weight: 600;
  margin-bottom: 18px;
}

.banner-exito {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
}

.banner-error {
  background: #fdecea;
  color: #c62828;
  border: 1px solid #f5c6c0;
}

.campo {
  margin-bottom: 16px;
}

.campo label {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: #444;
  margin-bottom: 6px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 48px 24px;
}

.empty-titulo {
  color: #d32f2f;
  font-size: 22px;
  font-weight: 700;
  margin-top: 12px;
}

.empty-msj {
  color: #6b7280;
  font-size: 16px;
  margin-top: 8px;
  max-width: 440px;
}
</style>
