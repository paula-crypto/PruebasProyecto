<template>
  <div class="recuperar-wrap">
    <div class="recuperar-card">
      <h4 class="brand">GCCON-F-088</h4>
      <p class="brand-sub">Paz y Salvo Contractual</p>

      <template v-if="!enviado">
        <div class="titulo">Recuperar contraseña</div>
        <p class="descripcion">
          Ingrese su correo institucional y le enviaremos instrucciones para restablecer su
          contraseña.
        </p>

        <div class="campo">
          <label>Correo institucional</label>
          <q-input
            v-model="correo"
            outlined
            dense
            type="email"
            :disable="cargando"
            hide-bottom-space
            bg-color="white"
            @keyup.enter="enviar"
          >
            <template #prepend>
              <q-icon name="mail_outline" />
            </template>
          </q-input>
        </div>

        <q-btn
          color="primary"
          no-caps
          label="Enviar enlace"
          class="full-width boton"
          :loading="cargando"
          @click="enviar"
        />

        <div class="volver row justify-around items-center">
          <a @click.prevent="volver">Volver a inicio de sesión</a>
          <span class="text-grey-4">|</span>
          <a @click.prevent="router.push('/restablecer')">¿Ya tienes un token?</a>
        </div>
      </template>

      <template v-else>
        <div class="enviado">
          <div class="enviado-icono">
            <q-icon name="mark_email_read" size="120px" color="primary" />
          </div>
          <div class="enviado-titulo">
            <q-icon name="mail" size="sm" class="q-mr-sm" />
            Solicitud enviada
          </div>
          <p class="descripcion">
            Si el correo está registrado, recibirá instrucciones para restablecer su contraseña.
          </p>

          <q-btn
            outline
            color="primary"
            label="Ingresar token de recuperación"
            class="full-width q-mb-md"
            @click="router.push('/restablecer')"
          />

          <div class="volver">
            <a @click.prevent="volver">Volver a inicio de sesión</a>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()
const correo = ref('')
const cargando = ref(false)
const enviado = ref(false)

async function enviar() {
  if (!correo.value.trim()) {
    return
  }
  cargando.value = true
  try {
    await api.post('/api/auth/recuperar', { correo_institucional: correo.value.trim() })
    enviado.value = true
  } catch {
    // El backend responde 200 aunque el correo no exista; solo informamos del envío.
    enviado.value = true
  } finally {
    cargando.value = false
  }
}

function volver() {
  router.push('/')
}
</script>

<style scoped>
.recuperar-wrap {
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

.recuperar-card {
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
  font-size: 15px;
  line-height: 1.5;
  margin: 12px 0 24px;
}

.campo {
  text-align: left;
  margin-bottom: 20px;
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
}

.volver {
  margin-top: 24px;
}

.volver a {
  color: #1565c0;
  cursor: pointer;
  font-size: 15px;
}

.volver a:hover {
  text-decoration: underline;
}

.enviado-icono {
  margin-bottom: 16px;
}

.enviado-titulo {
  font-size: 20px;
  font-weight: 700;
  color: #2f8c00;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
