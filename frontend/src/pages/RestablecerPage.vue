<template>
  <div class="restablecer-wrap">
    <div class="restablecer-card">
      <h4 class="brand">GCCON-F-088</h4>
      <p class="brand-sub">Paz y Salvo Contractual</p>

      <template v-if="!completado">
        <div class="titulo">Restablecer contraseña</div>
        <p class="descripcion">
          Cree una contraseña segura para su cuenta institucional. Debe tener al menos 8 caracteres,
          una mayúscula, una minúscula y un número.
        </p>

        <!-- Token si no viene en URL -->
        <div v-if="!tokenUrl" class="campo">
          <label>Token de seguridad</label>
          <q-input
            v-model="token"
            outlined
            dense
            placeholder="Pegue aquí el token recibido"
            :disable="cargando"
            bg-color="white"
          >
            <template #prepend>
              <q-icon name="key" />
            </template>
          </q-input>
        </div>

        <div class="campo">
          <label>Nueva contraseña</label>
          <q-input
            v-model="nuevaPassword"
            outlined
            dense
            :type="mostrarPassword ? 'text' : 'password'"
            :disable="cargando"
            bg-color="white"
          >
            <template #prepend>
              <q-icon name="lock_outline" />
            </template>
            <template #append>
              <q-icon
                :name="mostrarPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="mostrarPassword = !mostrarPassword"
              />
            </template>
          </q-input>
        </div>

        <div class="campo">
          <label>Confirmar nueva contraseña</label>
          <q-input
            v-model="confirmarPassword"
            outlined
            dense
            :type="mostrarConfirmar ? 'text' : 'password'"
            :disable="cargando"
            bg-color="white"
            @keyup.enter="restablecer"
          >
            <template #prepend>
              <q-icon name="lock" />
            </template>
            <template #append>
              <q-icon
                :name="mostrarConfirmar ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="mostrarConfirmar = !mostrarConfirmar"
              />
            </template>
          </q-input>
        </div>

        <div v-if="mensajeError" class="q-mb-md">
          <q-banner rounded dense class="bg-red-1 text-negative text-caption">
            <template #avatar>
              <q-icon name="error_outline" color="negative" />
            </template>
            {{ mensajeError }}
          </q-banner>
        </div>

        <q-btn
          color="primary"
          no-caps
          label="Guardar nueva contraseña"
          class="full-width boton"
          :loading="cargando"
          :disable="!formularioValido"
          @click="restablecer"
        />

        <div class="volver">
          <a @click.prevent="irALogin">Volver a inicio de sesión</a>
        </div>
      </template>

      <template v-else>
        <div class="exito">
          <div class="exito-icono">
            <q-icon name="check_circle" size="100px" color="positive" />
          </div>
          <div class="exito-titulo">¡Contraseña restablecida!</div>
          <p class="descripcion">
            Su contraseña ha sido actualizada exitosamente. Ya puede iniciar sesión con sus nuevas
            credenciales.
          </p>

          <q-btn
            color="primary"
            no-caps
            label="Iniciar Sesión"
            class="full-width boton"
            @click="irALogin"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../services/api'

const router = useRouter()
const route = useRoute()

const token = ref('')
const tokenUrl = ref(false)
const nuevaPassword = ref('')
const confirmarPassword = ref('')
const mostrarPassword = ref(false)
const mostrarConfirmar = ref(false)
const cargando = ref(false)
const completado = ref(false)
const mensajeError = ref('')

onMounted(() => {
  const queryToken = route.query.token || route.params.token
  if (queryToken) {
    token.value = String(queryToken)
    tokenUrl.value = true
  }
})

const formularioValido = computed(() => {
  return (
    token.value.trim().length > 0 &&
    nuevaPassword.value.length >= 8 &&
    confirmarPassword.value.length >= 8 &&
    nuevaPassword.value === confirmarPassword.value
  )
})

async function restablecer() {
  mensajeError.value = ''

  if (!token.value.trim()) {
    mensajeError.value = 'El token de seguridad es obligatorio.'
    return
  }
  if (nuevaPassword.value.length < 8) {
    mensajeError.value = 'La contraseña debe tener al menos 8 caracteres.'
    return
  }
  if (!/[A-Z]/.test(nuevaPassword.value)) {
    mensajeError.value = 'La contraseña debe incluir al menos una letra mayúscula.'
    return
  }
  if (!/[a-z]/.test(nuevaPassword.value)) {
    mensajeError.value = 'La contraseña debe incluir al menos una letra minúscula.'
    return
  }
  if (!/[0-9]/.test(nuevaPassword.value)) {
    mensajeError.value = 'La contraseña debe incluir al menos un número.'
    return
  }
  if (nuevaPassword.value !== confirmarPassword.value) {
    mensajeError.value = 'Las contraseñas no coinciden.'
    return
  }

  cargando.value = true
  try {
    await api.post('/auth/restablecer', {
      token: token.value.trim(),
      nueva_password: nuevaPassword.value,
    })
    completado.value = true
  } catch (err) {
    mensajeError.value =
      err.response?.data?.mensaje ||
      err.mensaje ||
      'No se pudo restablecer la contraseña. Verifique que el enlace o token no hayan expirado.'
  } finally {
    cargando.value = false
  }
}

function irALogin() {
  router.push('/login')
}
</script>

<style scoped>
.restablecer-wrap {
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

.restablecer-card {
  background: rgba(255, 255, 255, 0.94);
  border-radius: 18px;
  padding: 44px 40px;
  width: 100%;
  max-width: 470px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.12);
  text-align: center;
}

.brand {
  color: #2f8c00;
  font-size: 28px;
  font-weight: 700;
  margin: 0;
}

.brand-sub {
  color: #6b7280;
  margin: 4px 0 26px;
}

.titulo {
  font-size: 22px;
  font-weight: 700;
  color: #222;
}

.descripcion {
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
  margin: 12px 0 24px;
}

.campo {
  text-align: left;
  margin-bottom: 18px;
}

.campo label {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: #444;
  margin-bottom: 6px;
  letter-spacing: 0.4px;
}

.boton {
  height: 48px;
  font-weight: 700;
  letter-spacing: 0.5px;
  margin-top: 8px;
}

.volver {
  margin-top: 24px;
}

.volver a {
  color: #1565c0;
  cursor: pointer;
  font-size: 14px;
}

.volver a:hover {
  text-decoration: underline;
}

.exito-icono {
  margin-bottom: 16px;
}

.exito-titulo {
  font-size: 22px;
  font-weight: 700;
  color: #2f8c00;
  margin-bottom: 8px;
}
</style>
