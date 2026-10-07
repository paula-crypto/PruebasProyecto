<template>
  <q-page class="q-pa-md bg-grey-2">
    <div class="row q-col-gutter-md justify-center">
      <div class="col-12 col-md-10 col-lg-8">
        <!-- Encabezado -->
        <div class="row items-center q-mb-md">
          <q-btn icon="arrow_back" flat round dense color="grey-8" to="/app" class="q-mr-sm" />
          <div>
            <h5 class="text-h5 text-weight-bold q-my-none text-positive">
              Nueva Solicitud de Paz y Salvo
            </h5>
            <div class="text-caption text-grey-7">
              Diligencie la información requerida para el formato GCCON-F-088
            </div>
          </div>
        </div>

        <!-- Formulario Principal -->
        <q-card flat bordered class="q-pa-lg rounded-borders bg-white">
          <q-form @submit.prevent="guardarSolicitud" class="q-gutter-y-md">
            <!-- Datos del Contrato -->
            <div class="text-subtitle1 text-weight-bold text-grey-8 border-bottom q-pb-xs">
              1. Información del Contrato
            </div>

            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-4">
                <q-input
                  v-model="form.numeroContrato"
                  outlined
                  dense
                  label="Número de Contrato (Vigencia Actual) *"
                  placeholder="Ej. CNT-2026-014"
                  hint="Indique el contrato de la vigencia a liquidar (varía por año)"
                  :rules="[(val) => !!val || 'El número de contrato es obligatorio']"
                />
              </div>
              <div class="col-12 col-sm-4">
                <q-input
                  v-model="form.contratista"
                  outlined
                  dense
                  label="Nombre del Contratista *"
                  placeholder="Nombre completo del contratista"
                  :rules="[(val) => !!val || 'El nombre del contratista es obligatorio']"
                />
              </div>
              <div class="col-12 col-sm-4">
                <q-input
                  v-model="form.identificacion"
                  outlined
                  dense
                  label="Identificación / Cédula *"
                  placeholder="Ej. 1098765432"
                  hint="Documento oficial para GCCON-F-088"
                  :rules="[(val) => !!val || 'La identificación es obligatoria']"
                />
              </div>
            </div>

            <div class="row q-col-gutter-sm">
              <div class="col-12">
                <q-select
                  v-model="form.dependencia"
                  outlined
                  dense
                  label="Dependencia / Centro *"
                  hint="Dependencia principal de adscripción. Un único trámite valida todas las áreas del formato GCCON-F-088."
                  :options="opcionesDependencias"
                  :rules="[(val) => !!val || 'Seleccione la dependencia']"
                >
                  <template #prepend>
                    <q-icon name="apartment" color="primary" />
                  </template>
                </q-select>
              </div>
            </div>

            <!-- Mostrar el Responsable de Área al que va dirigida la solicitud -->
            <div v-if="responsableDependenciaActual" class="q-mt-xs q-mb-md">
              <q-banner dense rounded class="bg-blue-1 text-primary text-caption">
                <template #avatar>
                  <q-icon name="supervised_user_circle" color="primary" />
                </template>
                <div>
                  <strong>Responsable de Área:</strong>
                  {{ responsableDependenciaActual.responsable }}
                  <span v-if="responsableDependenciaActual.correo" class="text-grey-8">
                    ({{ responsableDependenciaActual.correo }})</span
                  >
                </div>
                <div class="text-grey-7 q-mt-xs">
                  Esta solicitud irá dirigida a este Responsable de Área para la validación de
                  bienes y firma de paz y salvo.
                </div>
              </q-banner>
            </div>

            <q-input
              v-model="form.objeto"
              outlined
              dense
              type="textarea"
              rows="3"
              label="Objeto Contractual *"
              placeholder="Descripción breve del objeto del contrato"
              :rules="[(val) => !!val || 'El objeto contractual es obligatorio']"
            />

            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.fechaInicio"
                  outlined
                  dense
                  type="date"
                  label="Fecha de Inicio *"
                  stack-label
                  :rules="[(val) => !!val || 'Seleccione la fecha inicial']"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.fechaFin"
                  outlined
                  dense
                  type="date"
                  label="Fecha de Terminación *"
                  stack-label
                  :rules="[(val) => !!val || 'Seleccione la fecha final']"
                />
              </div>
            </div>

            <!-- Asignación de Supervisor -->
            <div class="text-subtitle1 text-weight-bold text-grey-8 border-bottom q-pb-xs q-mt-lg">
              2. Asignación de Supervisión
            </div>

            <q-select
              v-model="form.supervisor"
              outlined
              dense
              label="Supervisor Asignado *"
              :options="opcionesSupervisores"
              option-label="nombre"
              option-value="id"
              :rules="[(val) => !!val || 'Seleccione el supervisor']"
            >
              <template #prepend>
                <q-icon name="supervisor_account" />
              </template>
            </q-select>

            <!-- Documentos adjuntos -->
            <div class="text-subtitle1 text-weight-bold text-grey-8 border-bottom q-pb-xs q-mt-lg">
              3. Soportes Requeridos
            </div>

            <q-file
              v-model="form.adjunto"
              outlined
              dense
              label="Adjuntar Informe Final o Soportes (PDF)"
              accept=".pdf"
            >
              <template #prepend>
                <q-icon name="attach_file" />
              </template>
            </q-file>

            <!-- Botones de Acción -->
            <div class="row justify-end q-gutter-sm q-mt-xl">
              <q-btn label="Cancelar" flat color="grey-7" to="/app" />
              <q-btn
                type="submit"
                color="positive"
                icon="save"
                label="Registrar Solicitud"
                unelevated
                :loading="cargando"
              />
            </div>
          </q-form>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Notify } from 'quasar'
import { useSolicitudesStore } from '../stores/useSolicitudesStore.js'
import { useDependenciasStore } from '../stores/useDependenciasStore.js'
import { useAuthStore } from '../stores/authStore.js'
import api from '../services/api'

const router = useRouter()
const store = useSolicitudesStore()
const dependenciasStore = useDependenciasStore()
const auth = useAuthStore()
const cargando = ref(false)

const anioActual = new Date().getFullYear()

const form = ref({
  numeroContrato:
    auth.usuario?.numeroContrato || `CNT-${anioActual}-${Math.floor(100 + Math.random() * 900)}`,
  contratista: auth.usuario?.nombre || '',
  identificacion: auth.usuario?.documento || auth.usuario?.identificacion || '',
  dependencia: null,
  objeto: '',
  fechaInicio: '',
  fechaFin: '',
  supervisor: null,
  adjunto: null,
})

const opcionesDependencias = ref([
  'Sistemas e Informática',
  'Gestión Tecnológica (TIC)',
  'Almacén e Inventarios',
  'Recursos Humanos',
  'Biblioteca y Archivo',
  'Bienestar al Aprendiz',
])

const opcionesSupervisores = ref([
  { id: 'sup-1', nombre: 'Ing. Carlos Supervisor' },
  { id: 'sup-2', nombre: 'Dra. Ana María Gómez' },
  { id: 'sup-3', nombre: 'Ing. Fernando Ramírez' },
])

const responsableDependenciaActual = computed(() => {
  if (!form.value.dependencia) return null
  const depNombre =
    typeof form.value.dependencia === 'object'
      ? form.value.dependencia.nombre || form.value.dependencia.label || ''
      : form.value.dependencia

  const encontrada = dependenciasStore.dependencias.find(
    (d) =>
      (d.nombre || d.nombre_dependencia || '').trim().toLowerCase() ===
      depNombre.trim().toLowerCase(),
  )
  if (encontrada && (encontrada.responsable || encontrada.responsable_id)) {
    const nom =
      encontrada.responsable ||
      encontrada.responsable_id?.nombre_completo ||
      encontrada.responsable_id?.nombre ||
      'Responsable Asignado'
    const correo =
      encontrada.correo ||
      encontrada.responsable_id?.correo_institucional ||
      encontrada.responsable_id?.correo ||
      ''
    return {
      responsable: nom,
      correo: correo,
    }
  }
  return null
})

onMounted(async () => {
  if (!form.value.contratista && auth.usuario?.nombre) {
    form.value.contratista = auth.usuario.nombre
  }
  if (!form.value.identificacion && (auth.usuario?.documento || auth.usuario?.identificacion)) {
    form.value.identificacion = auth.usuario?.documento || auth.usuario?.identificacion
  }
  try {
    await dependenciasStore.cargarDependencias()
    if (dependenciasStore.dependencias.length > 0) {
      opcionesDependencias.value = dependenciasStore.dependencias
        .filter((d) => d.estado !== 'Inactiva')
        .map((d) => d.nombre)
    }

    const supRes = await api.get('/usuarios?rol=Supervisor')
    const sups = Array.isArray(supRes.data) ? supRes.data : supRes.data?.usuarios || []
    if (sups.length > 0) {
      opcionesSupervisores.value = sups.map((s) => ({
        id: s._id || s.id,
        nombre: s.nombre_completo || s.nombre || 'Supervisor',
      }))
    }
  } catch (err) {
    console.warn('Carga de listas para nueva solicitud:', err.message)
  }
})

async function guardarSolicitud() {
  cargando.value = true

  const nomContratista = (
    form.value.contratista ||
    auth.usuario?.nombre ||
    auth.nombre ||
    'Contratista'
  ).trim()
  const docContratista = (
    form.value.identificacion ||
    auth.usuario?.documento ||
    auth.usuario?.identificacion ||
    ''
  ).trim()
  const supNombre =
    typeof form.value.supervisor === 'object'
      ? form.value.supervisor?.nombre
      : form.value.supervisor || 'Supervisor Asignado'
  const depNombre =
    typeof form.value.dependencia === 'object'
      ? form.value.dependencia?.nombre || form.value.dependencia?.label
      : form.value.dependencia || 'Gestión Tecnológica'

  const nuevaSolicitud = {
    numeroContrato: form.value.numeroContrato,
    contratista: nomContratista,
    nombreContratista: nomContratista,
    identificacion: docContratista,
    documentoContratista: docContratista,
    correo: auth.usuario?.correo || auth.usuario?.correo_institucional || '',
    dependencia: depNombre,
    responsable: supNombre,
    objeto: form.value.objeto,
    fechaInicio: form.value.fechaInicio,
    fechaFin: form.value.fechaFin,
    fecha: form.value.fechaInicio || new Date().toISOString().split('T')[0],
    estado: 'En revisión',
  }

  try {
    await store.agregarSolicitud(nuevaSolicitud)
    Notify.create({
      type: 'positive',
      message: 'Solicitud creada exitosamente y registrada en MongoDB Atlas.',
      position: 'top-right',
    })
    router.push({ name: 'solicitudes' })
  } catch (err) {
    console.error('Error al registrar solicitud:', err)
    Notify.create({
      type: 'negative',
      message: 'Error al registrar solicitud: ' + (err.message || ''),
      position: 'top-right',
    })
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
.border-bottom {
  border-bottom: 2px solid #e0e0e0;
}
</style>
