<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    fullscreen
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <div class="pdf-preview">
      <div class="pdf-topbar">
        <div class="pdf-title">PDF - Paz y Salvo Contractual</div>
        <q-btn
          flat
          round
          dense
          color="white"
          icon="close"
          @click="$emit('update:modelValue', false)"
        />
      </div>

      <q-toolbar class="pdf-toolbar">
        <q-btn flat round dense icon="menu" color="white" />
        <q-chip class="bg-white text-grey-9" dense square>
          <q-icon name="description" size="sm" class="q-mr-xs" />
          1/1
        </q-chip>
        <q-space />
        <span class="text-white text-body2">100%</span>
        <q-btn flat dense round icon="remove" color="white" />
        <q-btn flat dense round icon="add" color="white" />
      </q-toolbar>

      <div class="pdf-body">
        <iframe v-if="pdfUrl && item?.estado === 'Finalizado'" :src="pdfUrl" class="pdf-frame" />
        <div v-else class="paper">
          <div class="paper-head">
            <img src="../images/logo-sena.png" alt="SENA" class="paper-logo" />
            <div class="paper-titles">
              <div class="paper-title">Formato Paz y Salvo Contractual</div>
              <div class="paper-code">GCCON-F-088</div>
            </div>
          </div>

          <div class="paper-section">
            <h3>Información del contrato:</h3>
            <dl class="paper-dl">
              <dt>Número de contrato:</dt>
              <dd>{{ item?.numero || '—' }}</dd>
              <dt>Contratista:</dt>
              <dd>{{ item?.contratista || '—' }}</dd>
              <dt>Documento:</dt>
              <dd>{{ item?.documento || documento || '—' }}</dd>
              <dt>Fecha de solicitud:</dt>
              <dd>{{ item?.fecha ? formatearFecha(item.fecha) : '—' }}</dd>
            </dl>
          </div>

          <div class="paper-section">
            <h3>Dependencias</h3>
            <table class="paper-table">
              <thead>
                <tr>
                  <th>Dependencia</th>
                  <th>Estado</th>
                  <th>Responsable</th>
                  <th>Fecha Firma</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(d, i) in filasDependencias" :key="i">
                  <td>{{ d.dependencia || '—' }}</td>
                  <td>{{ d.estado || 'Pendiente' }}</td>
                  <td>{{ d.responsable || '—' }}</td>
                  <td>{{ d.fechaFirma ? formatearFecha(d.fechaFirma) : '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </q-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../stores/authStore'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  item: { type: Object, default: null },
  pdfUrl: { type: String, default: '' },
  documento: { type: String, default: '' },
  dependencias: { type: Array, default: () => [] },
})
defineEmits(['update:modelValue'])

const auth = useAuthStore()
const responsable = computed(() => auth.nombre || '')

const filasDependencias = computed(() => {
  if (props.dependencias && props.dependencias.length) {
    return props.dependencias
  }
  return [
    {
      dependencia: props.item?.area || '—',
      estado: props.item?.estado || 'Pendiente',
      responsable: responsable.value,
      fechaFirma: props.item?.fecha || null,
    },
  ]
})

function formatearFecha(fecha) {
  const d = new Date(fecha)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('es-CO')
}
</script>

<style scoped>
.pdf-preview {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #4a4a4a;
}

.pdf-topbar {
  background: #39a900;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
}

.pdf-title {
  font-size: 20px;
  font-weight: 700;
}

.pdf-toolbar {
  background: #6b6b6b;
  color: #fff;
  min-height: 44px;
}

.pdf-body {
  flex: 1;
  overflow: auto;
  display: flex;
  justify-content: center;
  padding: 24px;
  background: #5b5b5b;
}

.pdf-frame {
  width: 100%;
  max-width: 900px;
  height: 80vh;
  border: none;
  background: #fff;
}

.paper {
  width: 100%;
  max-width: 900px;
  background: #fff;
  padding: 60px 70px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
}

.paper-head {
  display: flex;
  align-items: center;
  gap: 18px;
  border-bottom: 3px solid #c7c7c7;
  padding-bottom: 16px;
  margin-bottom: 24px;
}

.paper-logo {
  width: 80px;
  height: auto;
}

.paper-titles {
  text-align: center;
  flex: 1;
}

.paper-title {
  font-size: 22px;
  font-weight: 700;
}

.paper-code {
  font-size: 20px;
  font-weight: 700;
  margin-top: 6px;
}

.paper-section h3 {
  font-size: 16px;
  margin: 0 0 12px;
}

.paper-dl {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 8px 18px;
  margin: 0;
  font-size: 15px;
}

.paper-dl dt {
  font-weight: 700;
}

.paper-dl dd {
  margin: 0;
}

.paper-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
  font-size: 14px;
}

.paper-table th,
.paper-table td {
  border: 1px solid #9e9e9e;
  padding: 8px 12px;
  text-align: left;
}

.paper-table th {
  background: #d7d7d7;
}
</style>
