<template>
  <div class="estado">
    <div class="estado-icono">
      <q-icon :name="icono" size="96px" :color="iconoColor" />
    </div>
    <div class="estado-titulo">
      {{ titulo }}
    </div>
    <div class="estado-mensaje">
      {{ mensaje }}
    </div>
    <q-btn
      v-if="boton"
      no-caps
      unelevated
      color="primary"
      :label="boton"
      class="q-mt-lg"
      @click="botonAccion"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  titulo: { type: String, default: '' },
  mensaje: { type: String, default: '' },
  icono: { type: String, default: 'error' },
  boton: { type: String, default: '' },
  botonAccion: { type: Function, default: null },
  tipo: { type: String, default: 'error' },
})

const iconoColor = computed(() => (props.tipo === 'info' ? 'primary' : 'grey-8'))
</script>

<style scoped>
.estado {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 24px;
  min-height: 60vh;
}

.estado-icono {
  margin-bottom: 24px;
  color: #5f6368;
}

.estado-titulo {
  color: #d32f2f;
  font-size: 26px;
  font-weight: 700;
}

.estado-mensaje {
  color: #6b7280;
  font-size: 17px;
  margin-top: 12px;
  max-width: 480px;
}
</style>
