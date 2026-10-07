<template>
  <q-card class="estado-card" :class="tipo" flat>
    <q-card-section class="row items-start no-wrap q-gutter-md q-pa-xl">
      <q-icon :name="icono" size="40px" :color="tipo === 'info' ? 'info' : 'negative'" />
      <div class="col">
        <div class="titulo">{{ titulo }}</div>
        <div class="mensaje">{{ mensaje }}</div>
        <div class="q-mt-lg">
          <q-btn
            v-if="boton"
            no-caps
            unelevated
            color="negative"
            :label="boton"
            @click="botonAccion"
          />
        </div>
      </div>
      <q-icon
        v-if="iconoGrande"
        :name="iconoGrande"
        size="86px"
        :color="tipo === 'info' ? 'info' : 'negative'"
      />
    </q-card-section>
  </q-card>
</template>

<script setup>
defineProps({
  titulo: { type: String, default: '' },
  mensaje: { type: String, default: '' },
  icono: { type: String, default: 'warning_amber' },
  iconoGrande: { type: String, default: '' },
  boton: { type: String, default: '' },
  botonAccion: { type: Function, default: null },
  tipo: { type: String, default: 'error' },
})
</script>

<style scoped>
.estado-card {
  border-radius: 12px;
}

.estado-card.error {
  background: #fdecea;
  border: 1px solid #f5c6c0;
}

.estado-card.info {
  background: #e8eaf6;
  border: 1px solid #c5cae9;
}

.titulo {
  color: #c62828;
  font-size: 24px;
  font-weight: 700;
}

.estado-card.info .titulo {
  color: #3f51b5;
}

.mensaje {
  color: #1b1b1b;
  font-size: 18px;
  margin-top: 14px;
  line-height: 1.5;
}
</style>
