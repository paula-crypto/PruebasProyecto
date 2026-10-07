<template>
  <q-page class="q-pa-lg">
    <div class="text-h4 text-weight-bold text-grey-9 q-mb-lg">Perfil de Usuario</div>

    <div class="row q-col-gutter-lg">
      <div class="col-12 col-md-6">
        <q-card flat bordered class="bg-white">
          <q-card-section class="text-h6">Información personal</q-card-section>
          <q-card-section class="q-pt-none">
            <q-input
              v-model="perfil.nombre"
              label="Nombre completo"
              outlined
              dense
              readonly
              class="q-mb-md"
              bg-color="grey-2"
            />
            <q-input
              v-model="perfil.documento"
              label="Documento"
              outlined
              dense
              readonly
              class="q-mb-md"
              bg-color="grey-2"
            />
            <q-input
              v-model="perfil.correo"
              label="Correo institucional"
              outlined
              dense
              readonly
              class="q-mb-md"
              bg-color="grey-2"
            />
            <q-input
              v-model="perfil.telefono"
              label="Teléfono"
              outlined
              dense
              readonly
              class="q-mb-md"
              bg-color="grey-2"
            />
            <q-input v-model="perfil.rol" label="Rol" outlined dense readonly bg-color="grey-2" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card flat bordered class="bg-white">
          <q-card-section class="text-h6">Cambiar contraseña</q-card-section>
          <q-card-section class="q-pt-none">
            <q-input
              v-model="claves.actual"
              label="Contraseña actual"
              outlined
              dense
              :type="tipo('a')"
              class="q-mb-md"
              :disable="procesando"
            >
              <template #append>
                <q-icon :name="ojo('a')" class="cursor-pointer" @click="toggle('a')" />
              </template>
            </q-input>
            <q-input
              v-model="claves.nueva"
              label="Nueva contraseña"
              outlined
              dense
              :type="tipo('n')"
              class="q-mb-md"
              :disable="procesando"
            >
              <template #append>
                <q-icon :name="ojo('n')" class="cursor-pointer" @click="toggle('n')" />
              </template>
            </q-input>
            <q-input
              v-model="claves.confirmar"
              label="Confirmar nueva contraseña"
              outlined
              dense
              :type="tipo('c')"
              class="q-mb-md"
              :disable="procesando"
            >
              <template #append>
                <q-icon :name="ojo('c')" class="cursor-pointer" @click="toggle('c')" />
              </template>
            </q-input>

            <div class="text-caption text-grey-6 q-mb-md">
              Mínimo 8 caracteres, debe incluir mayúsculas, minúsculas, números y símbolos.
            </div>

            <q-btn
              no-caps
              unelevated
              color="primary"
              label="Actualizar contraseña"
              :loading="procesando"
              @click="actualizarPassword"
            />
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
import { useAuthStore } from '../stores/authStore'

const $q = useQuasar()
const auth = useAuthStore()

const perfil = ref({
  nombre: auth.nombre,
  correo: auth.correo,
  documento: auth.documento,
  telefono: '',
  rol: auth.rol,
})

const claves = ref({ actual: '', nueva: '', confirmar: '' })
const procesando = ref(false)
const visibles = ref({ a: false, n: false, c: false })

onMounted(cargarPerfil)

async function cargarPerfil() {
  if (!auth.id) return
  try {
    const { data } = await api.get(`/api/usuarios/${auth.id}`)
    perfil.value = {
      nombre: data.nombre_completo,
      correo: data.correo_institucional,
      documento: data.documento || '',
      telefono: data.telefono || '',
      rol: data.rol,
    }
  } catch (error) {
    $q.notify({ type: 'negative', message: error.mensaje || 'No se pudo cargar su perfil.' })
  }
}

function tipo(k) {
  return visibles.value[k] ? 'text' : 'password'
}

function ojo(k) {
  return visibles.value[k] ? 'visibility' : 'visibility_off'
}

function toggle(k) {
  visibles.value[k] = !visibles.value[k]
}

async function actualizarPassword() {
  if (!claves.value.actual || !claves.value.nueva || !claves.value.confirmar) {
    $q.notify({ type: 'warning', message: 'Complete todos los campos de contraseña.' })
    return
  }
  if (claves.value.nueva !== claves.value.confirmar) {
    $q.notify({ type: 'warning', message: 'Las contraseñas no coinciden.' })
    return
  }

  procesando.value = true
  try {
    const { data } = await api.put('/api/auth/cambiar-password', {
      password_actual: claves.value.actual,
      nueva_password: claves.value.nueva,
    })
    $q.notify({ type: 'positive', message: data.mensaje || 'Contraseña actualizada.' })
    claves.value = { actual: '', nueva: '', confirmar: '' }
  } catch (error) {
    $q.notify({ type: 'negative', message: error.mensaje || 'No se pudo cambiar la contraseña.' })
  } finally {
    procesando.value = false
  }
}
</script>
