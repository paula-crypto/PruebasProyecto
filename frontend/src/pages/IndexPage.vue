<template>
  <div class="login-page">
    <q-card class="login-card">
      <img :src="logoSena" class="logo" alt="Logo del SENA" />

      <h4>Sistema GCCON-F-088</h4>

      <p>Paz y Salvo Contractual</p>

      <q-input outlined label="Documento de identidad" class="q-mb-md">
        <template v-slot:prepend>
          <q-icon name="badge" />
        </template>
      </q-input>

      <q-input outlined type="password" label="Contraseña" class="q-mb-lg">
        <template v-slot:prepend>
          <q-icon name="lock" />
        </template>
      </q-input>

      <q-btn color="positive" label="Iniciar sesión" class="full-width" />
    </q-card>
  </div>
</template>

<script setup>
import logoSena from '../images/logo-sena.png'
</script>

<style scoped>
.login-page {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f4f7f4;
}

.login-card {
  width: 420px;
  padding: 35px;
  border-radius: 20px;
  text-align: center;
}

.logo {
  display: block;
  width: 110px;
  margin: 0 auto 20px;
}

h4 {
  color: #39a900;
  margin-bottom: 5px;
}

p {
  color: gray;
  margin-bottom: 30px;
}
</style>
