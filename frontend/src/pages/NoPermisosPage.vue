<template>
  <q-page class="q-pa-lg">
    <EstadoPantalla
      titulo="No tiene permisos para acceder a esta sección"
      mensaje="Si considera que es un error, contacte al administrador"
      icono="gpp_bad"
      boton="Volver al inicio"
      :boton-accion="volver"
    />
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router'
import EstadoPantalla from '../components/EstadoPantalla.vue'

const router = useRouter()

function volver() {
  router.push('/app')
}
</script>
