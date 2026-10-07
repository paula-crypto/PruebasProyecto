<template>
  <q-page class="q-pa-lg">
    <!-- Encabezado -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h4 text-primary text-weight-bold">Plantilla GCCON-F-088</div>
        <div class="text-subtitle1 text-grey-7">
          Gestión dinámica y versionamiento del formato de paz y salvo institucional (RF-004)
        </div>
      </div>
      <q-btn
        color="primary"
        icon="refresh"
        label="Recargar Vigente"
        outline
        :loading="cargando"
        @click="cargarFormato"
      />
    </div>

    <div class="row q-col-gutter-lg">
      <!-- Formulario de Configuración -->
      <div class="col-12 col-md-7">
        <q-card flat bordered class="bg-white shadow-1 q-pa-md">
          <q-card-section>
            <div class="text-h6 text-grey-9 text-weight-bold q-mb-xs">
              Parámetros de la Versión Vigente
            </div>
            <div class="text-caption text-grey-6 q-mb-md">
              Cualquier cambio guardado invalidará la caché en memoria y aplicará inmediatamente a los
              nuevos trámites contractuales y PDFs generados.
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.codigo_formato"
                  label="Código del Formato"
                  outlined
                  dense
                  disable
                  hint="Identificador institucional no modificable"
                />
              </div>

              <div class="col-12 col-sm-6">
                <q-input
                  v-model.number="form.numero_version"
                  label="Número de Versión *"
                  type="number"
                  min="1"
                  outlined
                  dense
                  hint="Ej. 1, 2, 3..."
                />
              </div>

              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.fecha_vigencia"
                  label="Fecha de Vigencia *"
                  type="date"
                  outlined
                  dense
                  stack-label
                />
              </div>

              <div class="col-12">
                <q-input
                  v-model="form.texto_encabezado"
                  label="Texto del Encabezado / Declaración Institucional *"
                  type="textarea"
                  rows="4"
                  outlined
                  dense
                  hint="Texto legal que encabeza la constancia de paz y salvo"
                />
              </div>

              <div class="col-12">
                <div class="text-subtitle2 text-grey-8 q-mb-xs">Campos Obligatorios Requeridos</div>
                <div class="q-gutter-xs q-mb-sm">
                  <q-chip
                    v-for="(campo, idx) in form.campos_obligatorios"
                    :key="idx"
                    removable
                    color="primary"
                    text-color="white"
                    @remove="eliminarCampo(idx)"
                  >
                    {{ campo }}
                  </q-chip>
                </div>
                <div class="row q-col-gutter-sm items-center">
                  <div class="col-8">
                    <q-input
                      v-model="nuevoCampo"
                      dense
                      outlined
                      placeholder="Nuevo campo obligatorio (ej. bienes, supervisor)"
                      @keyup.enter="agregarCampo"
                    />
                  </div>
                  <div class="col-4">
                    <q-btn
                      outline
                      color="primary"
                      icon="add"
                      label="Añadir"
                      class="full-width"
                      @click="agregarCampo"
                    />
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="q-px-md q-pb-md">
            <q-btn
              unelevated
              color="primary"
              icon="save"
              label="Guardar y Publicar Versión"
              :loading="guardando"
              @click="guardarFormato"
            />
          </q-card-actions>
        </q-card>
      </div>

      <!-- Vista previa / Resumen -->
      <div class="col-12 col-md-5">
        <q-card flat bordered class="bg-white shadow-1 q-pa-md">
          <q-card-section>
            <div class="text-h6 text-grey-9 text-weight-bold q-mb-xs">
              Vista Previa Institucional
            </div>
            <div class="text-caption text-grey-6 q-mb-md">
              Estructura que encabezará el documento PDF GCCON-F-088
            </div>

            <!-- Recuadro simulado de documento -->
            <div class="q-pa-md border-preview rounded-borders bg-grey-1">
              <div class="row items-center justify-between q-mb-sm">
                <div class="text-weight-bolder text-primary text-subtitle1">SENA GCCON-F-088</div>
                <q-badge color="positive" class="text-weight-bold">
                  Versión {{ form.numero_version || 1 }}
                </q-badge>
              </div>

              <div class="text-caption text-grey-7 q-mb-sm">
                <strong>Vigencia:</strong> {{ form.fecha_vigencia || 'Sin definir' }}
              </div>

              <q-separator class="q-my-sm" />

              <div class="text-caption text-grey-8 text-italic q-my-sm">
                "{{ form.texto_encabezado || 'Constancia institucional de paz y salvo contractual.' }}"
              </div>

              <q-separator class="q-my-sm" />

              <div class="text-caption text-grey-7">
                <strong>Validación de campos obligatorios:</strong>
                <ul class="q-my-xs q-pl-md">
                  <li v-for="(c, i) in form.campos_obligatorios" :key="i">{{ c }}</li>
                </ul>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import api from '../services/api'

const $q = useQuasar()
const cargando = ref(false)
const guardando = ref(false)
const nuevoCampo = ref('')

const form = ref({
  codigo_formato: 'GCCON-F-088',
  numero_version: 1,
  fecha_vigencia: new Date().toISOString().split('T')[0],
  texto_encabezado:
    'Por medio del presente documento se hace constar que el contratista ha cumplido a satisfacción con la devolución y entrega de bienes institucionales.',
  campos_obligatorios: ['numero_contrato', 'contratista', 'dependencia', 'supervisor'],
})

async function cargarFormato() {
  cargando.value = true
  try {
    const res = await api.get('/formatos/vigente')
    if (res.data) {
      form.value = {
        codigo_formato: res.data.codigo_formato || 'GCCON-F-088',
        numero_version: res.data.numero_version || 1,
        fecha_vigencia: res.data.fecha_vigencia
          ? new Date(res.data.fecha_vigencia).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        texto_encabezado: res.data.texto_encabezado || form.value.texto_encabezado,
        campos_obligatorios: Array.isArray(res.data.campos_obligatorios) && res.data.campos_obligatorios.length > 0
          ? [...res.data.campos_obligatorios]
          : form.value.campos_obligatorios,
      }
    }
  } catch (err) {
    console.warn('Usando valores por defecto de la plantilla:', err.message)
  } finally {
    cargando.value = false
  }
}

function agregarCampo() {
  const campoLimpio = nuevoCampo.value.trim().toLowerCase().replace(/\s+/g, '_')
  if (campoLimpio && !form.value.campos_obligatorios.includes(campoLimpio)) {
    form.value.campos_obligatorios.push(campoLimpio)
    nuevoCampo.value = ''
  }
}

function eliminarCampo(index) {
  form.value.campos_obligatorios.splice(index, 1)
}

async function guardarFormato() {
  if (!form.value.numero_version || !form.value.texto_encabezado) {
    $q.notify({
      type: 'negative',
      message: 'Por favor complete el número de versión y el texto del encabezado.',
    })
    return
  }

  guardando.value = true
  try {
    const res = await api.put('/formatos/actualizar', {
      numero_version: Number(form.value.numero_version),
      fecha_vigencia: form.value.fecha_vigencia,
      texto_encabezado: form.value.texto_encabezado,
      campos_obligatorios: form.value.campos_obligatorios,
    })

    $q.notify({
      type: 'positive',
      message: res.data?.mensaje || 'Plantilla del formato GCCON-F-088 actualizada correctamente.',
    })
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err.response?.data?.mensaje || 'Error al actualizar la plantilla del formato.',
    })
  } finally {
    guardando.value = false
  }
}

onMounted(() => {
  cargarFormato()
})
</script>

<style scoped>
.border-preview {
  border: 2px dashed #c8e6c9;
}
</style>
