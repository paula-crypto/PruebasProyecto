<template>
  <div class="firma-canvas" @paste="alPegar">
    <q-toolbar class="q-pa-none q-mb-sm row items-center q-gutter-xs">
      <q-btn
        dense
        color="primary"
        icon="content_paste"
        label="Pegar Firma (Ctrl+V)"
        class="q-px-sm text-weight-bold"
        @click="pegarPortapapeles"
      >
        <q-tooltip>Pegar imagen de firma desde el portapapeles</q-tooltip>
      </q-btn>

      <q-btn
        flat
        dense
        color="secondary"
        icon="upload_file"
        label="Subir Imagen"
        class="q-px-sm"
        @click="seleccionarArchivo"
      >
        <q-tooltip>Cargar archivo de firma (PNG o JPG)</q-tooltip>
      </q-btn>

      <q-space />

      <q-btn
        flat
        dense
        color="grey-7"
        icon="cleaning_services"
        label="Limpiar / Dibujar"
        @click="limpiar"
      >
        <q-tooltip>Borrar firma y empezar de nuevo</q-tooltip>
      </q-btn>
    </q-toolbar>

    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      style="display: none"
      @change="alSeleccionarArchivo"
    />

    <!-- Editor interactivo de firma pegada o cargada -->
    <div v-if="imagenOriginal" class="contenedor-editor-firma">
      <div
        class="barra-edicion q-pa-xs row items-center justify-between bg-grey-2 rounded-borders q-mb-xs"
      >
        <div class="row items-center q-gutter-xs">
          <q-btn flat round dense size="sm" icon="zoom_out" @click="ajustarEscala(-0.15)">
            <q-tooltip>Reducir tamaño</q-tooltip>
          </q-btn>
          <div
            class="text-caption text-weight-bold text-primary"
            style="min-width: 44px; text-align: center"
          >
            {{ Math.round(escala * 100) }}%
          </div>
          <q-btn flat round dense size="sm" icon="zoom_in" @click="ajustarEscala(0.15)">
            <q-tooltip>Aumentar tamaño</q-tooltip>
          </q-btn>

          <q-separator vertical class="q-mx-xs" />

          <q-btn
            flat
            dense
            size="xs"
            color="primary"
            icon="crop"
            label="Auto-Ajustar"
            @click="ejecutarAutoRecorte"
          >
            <q-tooltip>Recortar márgenes vacíos para que la firma resalte</q-tooltip>
          </q-btn>

          <q-btn
            flat
            dense
            size="xs"
            :color="fondoTransparente ? 'positive' : 'grey-8'"
            icon="auto_fix_high"
            :label="fondoTransparente ? 'Fondo Transparente ✓' : 'Quitar Fondo Blanco'"
            @click="toggleFondo"
          >
            <q-tooltip>Hacer transparente el fondo blanco del papel</q-tooltip>
          </q-btn>

          <q-btn
            flat
            dense
            size="xs"
            color="grey-8"
            icon="rotate_right"
            label="Girar"
            @click="rotar"
          >
            <q-tooltip>Girar 90 grados</q-tooltip>
          </q-btn>
        </div>

        <q-btn
          flat
          dense
          size="xs"
          color="grey-7"
          icon="restart_alt"
          label="Centrar"
          @click="centrarFirma"
        >
          <q-tooltip>Centrar la firma en el recuadro</q-tooltip>
        </q-btn>
      </div>

      <!-- Lienzo donde se renderiza la firma editable con arrastre -->
      <div class="visor-firma-wrapper">
        <canvas
          ref="canvasEditorRef"
          class="lienzo-editor"
          @mousedown="iniciarArrastre"
          @mousemove="moverArrastre"
          @mouseup="terminarArrastre"
          @mouseleave="terminarArrastre"
          @touchstart="iniciarArrastreTouch"
          @touchmove="moverArrastreTouch"
          @touchend="terminarArrastre"
        />
        <div class="guia-referencia-firma pointer-events-none">
          <div class="linea-guia"></div>
          <span class="texto-guia">Línea de firma del documento</span>
        </div>
      </div>

      <!-- Control deslizante de tamaño -->
      <div class="row items-center q-px-sm q-mt-xs q-col-gutter-sm">
        <div class="col-auto text-caption text-weight-medium text-grey-9">
          <q-icon name="photo_size_select_large" class="q-mr-xs text-primary" />
          Tamaño:
        </div>
        <div class="col">
          <q-slider
            v-model="escala"
            :min="0.3"
            :max="3.0"
            :step="0.05"
            label
            :label-value="`${Math.round(escala * 100)}%`"
            color="primary"
            dense
            @update:model-value="redibujarEditor"
          />
        </div>
      </div>

      <div class="text-caption text-grey-7 text-center q-mt-xs">
        <q-icon name="pan_tool" size="14px" class="q-mr-xs text-primary" />
        <em>Haz clic y arrastra sobre el recuadro para acomodar la posición de tu firma.</em>
      </div>
    </div>

    <!-- Lienzo interactivo de dibujo a mano cuando no hay imagen cargada -->
    <div v-else class="contenedor-lienzo" @click="enfocarCanvas">
      <canvas
        ref="canvasRef"
        class="lienzo"
        tabindex="0"
        @pointerdown="iniciarTrazo"
        @pointermove="dibujarTrazo"
        @pointerup="terminarTrazo"
        @pointerleave="terminarTrazo"
        @paste="alPegar"
      />
      <div v-if="!tieneTrazo" class="guia-pegar pointer-events-none">
        <q-icon name="content_paste" size="36px" color="primary" class="q-mb-xs" />
        <div class="text-subtitle2 text-primary text-weight-bold">
          Pega tu firma con Ctrl + V o usa los botones de arriba
        </div>
        <div class="text-caption text-grey-7">
          Puedes subir una foto/captura de tu firma o dibujarla con el ratón aquí
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

const canvasRef = ref(null)
const canvasEditorRef = ref(null)
const fileInputRef = ref(null)

const imagenOriginal = ref(null)
const imagenProcesada = ref(null)
const fondoTransparente = ref(false)
const tieneTrazo = ref(false)

const escala = ref(1.0)
const rotacion = ref(0)
const posicion = ref({ x: 0, y: 0 })

let ctxDibujo = null
let dibujando = false
let ultimoPunto = null

let arrastrando = false
let inicioDrag = { x: 0, y: 0 }
let imgElement = null

const DPI_X = window.devicePixelRatio || 1

onMounted(() => {
  nextTick(() => {
    inicializarCanvasDibujo()
  })
  window.addEventListener('paste', alPegar)
})

onBeforeUnmount(() => {
  window.removeEventListener('paste', alPegar)
})

/* =================== MODO DIBUJO =================== */
function inicializarCanvasDibujo() {
  const canvas = canvasRef.value
  if (!canvas) return
  ctxDibujo = canvas.getContext('2d')

  const rect = canvas.getBoundingClientRect()
  const width = rect.width > 0 ? rect.width : 480
  const height = rect.height > 0 ? rect.height : 220

  canvas.width = width * DPI_X
  canvas.height = height * DPI_X
  ctxDibujo.scale(DPI_X, DPI_X)

  ctxDibujo.lineWidth = 2.5
  ctxDibujo.lineCap = 'round'
  ctxDibujo.lineJoin = 'round'
  ctxDibujo.strokeStyle = '#1d1d1d'
  ctxDibujo.fillStyle = '#ffffff'
  ctxDibujo.fillRect(0, 0, width, height)
}

function enfocarCanvas() {
  if (canvasRef.value) {
    canvasRef.value.focus()
  }
}

function obtenerPosicion(event) {
  const rect = canvasRef.value.getBoundingClientRect()
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  }
}

function iniciarTrazo(event) {
  dibujando = true
  tieneTrazo.value = true
  ultimoPunto = obtenerPosicion(event)
  event.preventDefault()
}

function dibujarTrazo(event) {
  if (!dibujando) return
  const punto = obtenerPosicion(event)
  ctxDibujo.beginPath()
  ctxDibujo.moveTo(ultimoPunto.x, ultimoPunto.y)
  ctxDibujo.lineTo(punto.x, punto.y)
  ctxDibujo.stroke()
  ultimoPunto = punto
  event.preventDefault()
}

function terminarTrazo() {
  dibujando = false
  ultimoPunto = null
}

function limpiar() {
  imagenOriginal.value = null
  imagenProcesada.value = null
  fondoTransparente.value = false
  tieneTrazo.value = false
  escala.value = 1.0
  rotacion.value = 0
  posicion.value = { x: 0, y: 0 }
  imgElement = null

  nextTick(() => {
    if (canvasRef.value) {
      inicializarCanvasDibujo()
    }
  })
}

/* =================== CARGA Y PROCESAMIENTO DE IMÁGENES =================== */
function cargarDataUrl(dataUrl) {
  imagenOriginal.value = dataUrl
  fondoTransparente.value = false
  rotacion.value = 0
  posicion.value = { x: 0, y: 0 }

  // Cargar y auto-recortar márgenes de inmediato
  const img = new Image()
  img.onload = () => {
    const recortada = autoRecortarImagen(img)
    imagenProcesada.value = recortada
    cargarElementoImagen(recortada)
  }
  img.src = dataUrl
}

function cargarElementoImagen(src) {
  imgElement = new Image()
  imgElement.onload = () => {
    nextTick(() => {
      inicializarCanvasEditor()
    })
  }
  imgElement.src = src
}

/* Auto-recorte inteligente: detecta píxeles que no sean fondo blanco/transparente */
function autoRecortarImagen(imgSource) {
  try {
    const temp = document.createElement('canvas')
    const w = imgSource.naturalWidth || imgSource.width
    const h = imgSource.naturalHeight || imgSource.height
    temp.width = w
    temp.height = h
    const tctx = temp.getContext('2d')
    tctx.drawImage(imgSource, 0, 0)

    const imgData = tctx.getImageData(0, 0, w, h)
    const data = imgData.data

    let minX = w,
      minY = h,
      maxX = 0,
      maxY = 0
    let hayContenido = false

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        const a = data[i + 3]

        const esBlanco = r > 235 && g > 235 && b > 235
        const esTransparente = a < 25

        if (!esBlanco && !esTransparente) {
          hayContenido = true
          if (x < minX) minX = x
          if (x > maxX) maxX = x
          if (y < minY) minY = y
          if (y > maxY) maxY = y
        }
      }
    }

    if (!hayContenido || maxX <= minX || maxY <= minY) {
      return temp.toDataURL('image/png')
    }

    // Agregar un margen estético de 12px
    const pad = 12
    const cropX = Math.max(0, minX - pad)
    const cropY = Math.max(0, minY - pad)
    const cropW = Math.min(w - cropX, maxX - minX + pad * 2)
    const cropH = Math.min(h - cropY, maxY - minY + pad * 2)

    const cropCanvas = document.createElement('canvas')
    cropCanvas.width = cropW
    cropCanvas.height = cropH
    const cropCtx = cropCanvas.getContext('2d')
    cropCtx.drawImage(temp, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH)

    return cropCanvas.toDataURL('image/png')
  } catch (err) {
    console.warn('Auto-recorte fallback:', err)
    return imgSource.src || imagenOriginal.value
  }
}

function ejecutarAutoRecorte() {
  if (!imagenOriginal.value) return
  const img = new Image()
  img.onload = () => {
    let recortada = autoRecortarImagen(img)
    if (fondoTransparente.value) {
      hacerFondoTransparente(recortada).then((transp) => {
        imagenProcesada.value = transp
        cargarElementoImagen(transp)
      })
    } else {
      imagenProcesada.value = recortada
      cargarElementoImagen(recortada)
    }
  }
  img.src = imagenOriginal.value
}

function hacerFondoTransparente(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = img.width
      c.height = img.height
      const ctx = c.getContext('2d')
      ctx.drawImage(img, 0, 0)
      const idata = ctx.getImageData(0, 0, c.width, c.height)
      const d = idata.data
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i]
        const g = d[i + 1]
        const b = d[i + 2]
        // Si el pixel es blanco o casi blanco de papel, volverlo transparente
        if (r > 210 && g > 210 && b > 210) {
          d[i + 3] = 0
        }
      }
      ctx.putImageData(idata, 0, 0)
      resolve(c.toDataURL('image/png'))
    }
    img.src = dataUrl
  })
}

async function toggleFondo() {
  fondoTransparente.value = !fondoTransparente.value
  const baseImg = imagenProcesada.value || imagenOriginal.value
  if (!baseImg) return

  if (fondoTransparente.value) {
    const transparente = await hacerFondoTransparente(baseImg)
    imagenProcesada.value = transparente
    cargarElementoImagen(transparente)
  } else {
    ejecutarAutoRecorte()
  }
}

function rotar() {
  rotacion.value = (rotacion.value + 90) % 360
  redibujarEditor()
}

function ajustarEscala(delta) {
  const nueva = Math.round((escala.value + delta) * 100) / 100
  escala.value = Math.max(0.3, Math.min(3.0, nueva))
  redibujarEditor()
}

function centrarFirma() {
  posicion.value = { x: 0, y: 0 }
  escala.value = 1.0
  rotacion.value = 0
  redibujarEditor()
}

/* =================== LIENZO DE EDICIÓN Y AJUSTE =================== */
function inicializarCanvasEditor() {
  const canvas = canvasEditorRef.value
  if (!canvas || !imgElement) return

  const rect = canvas.getBoundingClientRect()
  const width = rect.width > 0 ? rect.width : 480
  const height = rect.height > 0 ? rect.height : 220

  canvas.width = width * DPI_X
  canvas.height = height * DPI_X

  const ratioW = (width * 0.85) / imgElement.width
  const ratioH = (height * 0.7) / imgElement.height
  const baseScale = Math.min(ratioW, ratioH)
  if (baseScale > 0) {
    escala.value = Math.max(0.6, Math.min(2.0, Math.round(baseScale * 100) / 100))
  }

  redibujarEditor()
}

function redibujarEditor() {
  const canvas = canvasEditorRef.value
  if (!canvas || !imgElement) return

  const ctx = canvas.getContext('2d')
  const w = canvas.width / DPI_X
  const h = canvas.height / DPI_X

  ctx.save()
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.scale(DPI_X, DPI_X)

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, w, h)

  ctx.strokeStyle = '#f0f0f0'
  ctx.lineWidth = 1
  for (let x = 0; x < w; x += 20) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, h)
    ctx.stroke()
  }
  for (let y = 0; y < h; y += 20) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(w, y)
    ctx.stroke()
  }

  const baseLineaY = h * 0.75
  ctx.strokeStyle = '#bdbdbd'
  ctx.setLineDash([5, 5])
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(30, baseLineaY)
  ctx.lineTo(w - 30, baseLineaY)
  ctx.stroke()
  ctx.setLineDash([])

  ctx.save()
  const centroX = w / 2 + posicion.value.x
  const centroY = baseLineaY - 30 + posicion.value.y
  ctx.translate(centroX, centroY)

  if (rotacion.value !== 0) {
    ctx.rotate((rotacion.value * Math.PI) / 180)
  }

  ctx.scale(escala.value, escala.value)

  const drawW = imgElement.width
  const drawH = imgElement.height
  ctx.drawImage(imgElement, -drawW / 2, -drawH / 2, drawW, drawH)
  ctx.restore()

  ctx.restore()
}

function iniciarArrastre(e) {
  arrastrando = true
  inicioDrag = { x: e.clientX - posicion.value.x, y: e.clientY - posicion.value.y }
}

function moverArrastre(e) {
  if (!arrastrando) return
  posicion.value = {
    x: e.clientX - inicioDrag.x,
    y: e.clientY - inicioDrag.y,
  }
  redibujarEditor()
}

function terminarArrastre() {
  arrastrando = false
}

function iniciarArrastreTouch(e) {
  if (e.touches && e.touches[0]) {
    arrastrando = true
    inicioDrag = {
      x: e.touches[0].clientX - posicion.value.x,
      y: e.touches[0].clientY - posicion.value.y,
    }
  }
}

function moverArrastreTouch(e) {
  if (!arrastrando || !e.touches || !e.touches[0]) return
  posicion.value = {
    x: e.touches[0].clientX - inicioDrag.x,
    y: e.touches[0].clientY - inicioDrag.y,
  }
  redibujarEditor()
}

/* =================== PEGAR Y ARCHIVO =================== */
async function pegarPortapapeles() {
  try {
    if (navigator.clipboard && navigator.clipboard.read) {
      const items = await navigator.clipboard.read()
      for (const item of items) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type)
            const reader = new FileReader()
            reader.onload = (e) => cargarDataUrl(e.target.result)
            reader.readAsDataURL(blob)
            return
          }
        }
      }
    }
    seleccionarArchivo()
  } catch {
    seleccionarArchivo()
  }
}

function alPegar(e) {
  const items = e.clipboardData?.items
  if (!items) return
  for (const item of items) {
    if (item.type && item.type.startsWith('image/')) {
      const blob = item.getAsFile()
      if (blob) {
        const reader = new FileReader()
        reader.onload = (evt) => {
          cargarDataUrl(evt.target.result)
        }
        reader.readAsDataURL(blob)
        e.preventDefault()
        return
      }
    }
  }
}

function seleccionarArchivo() {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

function alSeleccionarArchivo(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (evt) => {
    cargarDataUrl(evt.target.result)
  }
  reader.readAsDataURL(file)
  e.target.value = ''
}

/* =================== EXPORTACIÓN BASE64 =================== */
function exportarBase64() {
  if (imagenOriginal.value && imgElement) {
    const exportCanvas = document.createElement('canvas')
    const expW = 600
    const expH = 220
    exportCanvas.width = expW
    exportCanvas.height = expH
    const ectx = exportCanvas.getContext('2d')

    ectx.clearRect(0, 0, expW, expH)

    const baseLineaY = expH * 0.75

    ectx.save()
    const editorCanvas = canvasEditorRef.value
    const factorW = editorCanvas ? expW / (editorCanvas.width / DPI_X) : 1

    const centroX = expW / 2 + posicion.value.x * factorW
    const centroY = baseLineaY - 30 + posicion.value.y * factorW

    ectx.translate(centroX, centroY)

    if (rotacion.value !== 0) {
      ectx.rotate((rotacion.value * Math.PI) / 180)
    }

    const factorEscala = escala.value * factorW
    ectx.scale(factorEscala, factorEscala)

    ectx.drawImage(imgElement, -imgElement.width / 2, -imgElement.height / 2)
    ectx.restore()

    return exportCanvas.toDataURL('image/png')
  }

  if (canvasRef.value) {
    return canvasRef.value.toDataURL('image/png')
  }

  return ''
}

defineExpose({ limpiar, cargarDataUrl, pegarPortapapeles, seleccionarArchivo, exportarBase64 })
</script>

<style scoped>
.firma-canvas {
  width: 100%;
}

.contenedor-editor-firma {
  width: 100%;
  border: 1.5px solid #1976d2;
  border-radius: 8px;
  background: #ffffff;
  padding: 8px;
  box-sizing: border-box;
}

.barra-edicion {
  border: 1px solid #e0e0e0;
}

.visor-firma-wrapper {
  position: relative;
  width: 100%;
  height: 220px;
  border: 1px dashed #90caf9;
  border-radius: 6px;
  background: #ffffff;
  overflow: hidden;
  cursor: grab;
}

.visor-firma-wrapper:active {
  cursor: grabbing;
}

.lienzo-editor {
  width: 100%;
  height: 100%;
  display: block;
}

.guia-referencia-firma {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.texto-guia {
  font-size: 10px;
  font-weight: 700;
  color: #757575;
  background: rgba(255, 255, 255, 0.85);
  padding: 1px 8px;
  border-radius: 4px;
}

.contenedor-lienzo {
  position: relative;
  width: 100%;
  cursor: crosshair;
}

.lienzo {
  width: 100%;
  height: 220px;
  border: 2px dashed #90caf9;
  border-radius: 8px;
  background: #ffffff;
  touch-action: none;
  display: block;
}

.lienzo:focus {
  outline: 2px solid #1976d2;
  border-color: #1976d2;
}

.guia-pegar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  pointer-events: none;
  background: rgba(255, 255, 255, 0.6);
  padding: 12px;
}
</style>
