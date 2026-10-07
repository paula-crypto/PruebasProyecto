<template>
  <div class="sesion-wrap">
    <div class="sesion-card">
      <q-icon name="schedule" size="96px" color="primary" />
      <div class="sesion-titulo">Su sesión ha expirado.</div>
      <div class="sesion-mensaje">Debe iniciar sesión nuevamente.</div>
      <q-btn
        no-caps
        unelevated
        color="primary"
        label="Volver al inicio"
        class="q-mt-lg"
        @click="volverInicio"
      />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const auth = useAuthStore()

function volverInicio() {
  auth.logout()
  router.push('/')
}
</script>

<style scoped>
.sesion-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background:
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0) 45%),
    radial-gradient(circle at 80% 70%, rgba(57, 169, 0, 0.1), rgba(255, 255, 255, 0) 50%),
    linear-gradient(130deg, #cfd6d3 0%, #e6ebe9 45%, #d4dbd8 100%);
}

.sesion-card {
  background: rgba(255, 255, 255, 0.96);
  border-radius: 18px;
  padding: 44px 40px;
  width: 100%;
  max-width: 460px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.12);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.sesion-titulo {
  color: #d32f2f;
  font-size: 24px;
  font-weight: 700;
  margin-top: 18px;
}

.sesion-mensaje {
  color: #1b1b1b;
  font-size: 17px;
  margin-top: 12px;
}
</style>
