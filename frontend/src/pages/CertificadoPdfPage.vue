<template>
  <q-page class="page-formato">
    <div class="toolbar no-print">
      <!-- Lado Izquierdo: Volver + Estado de la Solicitud -->
      <div class="toolbar-left row items-center q-gutter-sm no-wrap">
        <q-btn
          flat
          dense
          color="grey-9"
          icon="arrow_back"
          label="Volver"
          class="text-weight-bold"
          @click="volver"
        />
        <q-separator vertical inset class="q-mx-xs" />
        <q-chip
          v-if="datosSolicitud.estado === 'Rechazado'"
          dense
          color="red-1"
          text-color="negative"
          icon="cancel"
          class="text-weight-bold q-px-sm"
        >
          Solicitud Rechazada
        </q-chip>
        <q-chip
          v-else-if="datosSolicitud.estado === 'Firmado' || datosSolicitud.estado === 'Finalizado'"
          dense
          color="green-1"
          text-color="positive"
          icon="check_circle"
          class="text-weight-bold q-px-sm"
        >
          Paz y Salvo Vigente
        </q-chip>
        <q-chip
          v-else
          dense
          color="amber-1"
          text-color="brown-9"
          icon="schedule"
          class="text-weight-bold q-px-sm"
        >
          En Revisión
        </q-chip>
      </div>

      <!-- Lado Derecho: Acciones principales con estilo homogéneo en una sola fila -->
      <div class="toolbar-right row items-center q-gutter-sm no-wrap">
        <q-btn
          v-if="
            miFilaParaFirmar &&
            datosSolicitud.estado !== 'Rechazado' &&
            !firmasTabla[miFilaParaFirmar.id]
          "
          outline
          dense
          color="primary"
          icon="history_edu"
          :label="'Firmar ' + (miFilaParaFirmar.id === 14 ? 'Supervisión' : 'Mi Área')"
          class="q-px-sm"
          @click="abrirModalFirmaFila(miFilaParaFirmar)"
        >
          <q-tooltip
            >Estampar tu firma oficial en
            {{ miFilaParaFirmar.dependencia.replace(/<[^>]*>/g, ' ') }}</q-tooltip
          >
        </q-btn>
        <q-btn
          v-if="
            miFilaParaFirmar &&
            datosSolicitud.estado !== 'Rechazado' &&
            firmasTabla[miFilaParaFirmar.id]
          "
          flat
          dense
          color="grey-7"
          icon="close"
          class="q-px-xs"
          @click="limpiarMiFirma"
        >
          <q-tooltip>Borrar firma de mi área</q-tooltip>
        </q-btn>
        <q-btn
          outline
          dense
          color="primary"
          icon="edit_note"
          label="Editar Formato"
          class="q-px-sm"
          @click="abrirModalEditarDatos"
        >
          <q-tooltip
            >Modificar o completar datos del contratista, contrato, regional y causal</q-tooltip
          >
        </q-btn>
        <q-btn
          unelevated
          dense
          :color="datosSolicitud.estado === 'Rechazado' ? 'grey-8' : 'positive'"
          icon="print"
          :label="datosSolicitud.estado === 'Rechazado' ? 'Imprimir Borrador' : 'Imprimir'"
          class="q-px-md text-weight-bold"
          @click="imprimir"
        >
          <q-tooltip>Imprimir o guardar como PDF oficial</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Banner informativo en pantalla si la solicitud fue rechazada -->
    <div
      v-if="datosSolicitud.estado === 'Rechazado'"
      class="banner-alerta-pantalla no-print q-mb-md"
    >
      <q-banner rounded class="bg-red-1 text-negative border-banner-rechazo shadow-2">
        <template #avatar>
          <q-avatar icon="error" color="negative" text-color="white" />
        </template>
        <div class="text-subtitle1 text-weight-bold">SOLICITUD DE PAZ Y SALVO RECHAZADA</div>
        <div class="text-body2 text-grey-9 q-mt-xs">
          Esta solicitud presenta novedades u obligaciones pendientes por subsanar.
          <strong>La firma del contratista permanece retenida</strong> y el documento no tiene
          validez legal como paz y salvo definitivo hasta que las dependencias validen y aprueben el
          trámite.
        </div>
        <div
          v-if="datosSolicitud.observacionRechazo"
          class="q-mt-sm q-pa-sm bg-white rounded-borders text-caption text-weight-bold text-negative border-novedad-rechazo"
        >
          Novedad / Observación reportada: {{ datosSolicitud.observacionRechazo }}
        </div>
      </q-banner>
    </div>

    <div class="documento-wrapper">
      <div class="documento">
        <!-- Marca de agua si la solicitud está rechazada -->
        <div v-if="datosSolicitud.estado === 'Rechazado'" class="marca-agua-rechazado">
          SOLICITUD RECHAZADA - NO VÁLIDO
        </div>
        <!-- Encabezado con Logo y Versión -->
        <div class="encabezado-topo">
          <div class="encabezado-spacer"></div>
          <div class="logo-box">
            <img :src="logoSena" alt="Logo SENA" class="logo-sena" />
          </div>

          <div class="version-box">
            <div class="version-fila">Versión: 1</div>
            <div class="version-fila">
              <div>Código:</div>
              <div>GCCON-F-088</div>
            </div>
          </div>
        </div>

        <!-- Títulos Principales en Bloques Negros y Blancos -->
        <div class="barra-negra">PROCESO</div>
        <div class="fila-blanca">GESTIÓN CONTRACTUAL</div>
        <div class="barra-negra">NOMBRE DEL FORMATO</div>
        <div class="fila-blanca texto-formato">
          ENTREGA DE BIENES E INFORMACIÓN DE EJECUCIÓN CONTRACTUAL POR EL CONTRATISTA
        </div>
        <div class="barra-negra">CLASIFICACIÓN DE LA INFORMACIÓN</div>

        <!-- Tabla de Clasificación de la Información (6 celdas exactas) -->
        <!-- Tabla de Clasificación de la Información (6 celdas exactas) -->
        <div
          class="clasificacion-tabla cursor-pointer"
          @click="abrirModalEditarDatos"
          title="Clic para cambiar clasificación de la información"
        >
          <div class="clasif-col">Pública</div>
          <div class="clasif-check">
            {{
              datosSolicitud.clasificacion === 'Publica' || !datosSolicitud.clasificacion ? 'X' : ''
            }}
          </div>
          <div class="clasif-col">Pública Clasificada</div>
          <div class="clasif-check">
            {{ datosSolicitud.clasificacion === 'Publica Clasificada' ? 'X' : '' }}
          </div>
          <div class="clasif-col">Pública Reservada</div>
          <div class="clasif-check">
            {{ datosSolicitud.clasificacion === 'Publica Reservada' ? 'X' : '' }}
          </div>
        </div>

        <!-- Datos del Contratista - Cuadrícula Oficial GCCON-F-088 -->
        <div
          class="seccion-datos cursor-pointer"
          @click="abrirModalEditarDatos"
          title="Clic para editar o corregir datos del contratista, fechas o contrato"
        >
          <!-- Fila 1: Nombres y Apellidos del Contratista | Identificación -->
          <div class="fila-contratista-1">
            <div class="celda-nombre-contratista">
              <span class="etiqueta-form">NOMBRES Y APELLIDOS DEL CONTRATISTA:</span>
              <span class="valor-form text-weight-bold">{{ datosSolicitud.contratista }}</span>
            </div>
            <div class="celda-identificacion-header">IDENTIFICACIÓN</div>
          </div>

          <!-- Fila 2: Ciudad | Fecha | Regional | Valor Identificación -->
          <div class="fila-contratista-2">
            <div class="bloque-ciudad-fecha-regional">
              <div class="celda-etiqueta celda-ciudad-lbl">CIUDAD</div>
              <div class="celda-valor celda-ciudad-val">{{ datosSolicitud.ciudad }}</div>
              <div class="celda-etiqueta celda-fecha-lbl">FECHA</div>
              <div class="celda-valor celda-fecha-val">{{ datosSolicitud.fecha }}</div>
              <div class="celda-etiqueta celda-regional-lbl">REGIONAL</div>
              <div class="celda-valor celda-regional-val">{{ datosSolicitud.regional }}</div>
            </div>
            <div class="celda-identificacion-valor">
              {{ datosSolicitud.identificacion }}
            </div>
          </div>

          <!-- Fila 3: Dirección u Oficina donde se ejecutó el contrato -->
          <div class="fila-contratista-3">
            <div class="celda-etiqueta celda-direccion-lbl">
              DIRECCIÓN U OFICINA DONDE SE EJECUTÓ EL CONTRATO:
            </div>
            <div class="celda-valor celda-direccion-val">{{ datosSolicitud.direccion }}</div>
          </div>

          <!-- Fila 4: Número y Fecha de Contrato -->
          <div class="fila-contratista-4">
            <div class="celda-etiqueta celda-contrato-lbl">NÚMERO Y FECHA DE CONTRATO:</div>
            <div class="celda-valor celda-contrato-val">
              <template v-if="datosSolicitud.numeroContrato && datosSolicitud.fechaContrato">
                <span class="text-weight-bold">{{ datosSolicitud.numeroContrato }}</span>
                <span class="q-mx-sm">—</span>
                <span>{{ datosSolicitud.fechaContrato }}</span>
              </template>
              <template v-else-if="datosSolicitud.numeroContrato">
                <span class="text-weight-bold">{{ datosSolicitud.numeroContrato }}</span>
              </template>
              <template v-else>
                <span>{{ datosSolicitud.contrato }}</span>
              </template>
            </div>
          </div>
        </div>

        <!-- Causal de Terminación del Contrato -->
        <div class="titulo-causal">CAUSAL DE TERMINACIÓN DEL CONTRATO</div>

        <div
          class="fila-causales cursor-pointer"
          @click="abrirModalEditarDatos"
          title="Clic para seleccionar causal de terminación"
        >
          <div class="causal-item">
            <span class="causal-nombre">LIQUIDACIÓN POR MUTUO<br />ACUERDO</span>
            <div class="causal-caja-cuadrada">
              {{
                datosSolicitud.causalTerminacion === 'LIQUIDACION_MUTUO_ACUERDO' ||
                !datosSolicitud.causalTerminacion
                  ? 'X'
                  : ''
              }}
            </div>
          </div>
          <div class="causal-item">
            <span class="causal-nombre">CESIÓN</span>
            <div class="causal-caja-rect">
              {{ datosSolicitud.causalTerminacion === 'CESION' ? 'X' : '' }}
            </div>
          </div>
          <div class="causal-item">
            <span class="causal-nombre">LIQUIDACIÓN ANTICIPADA<br />POR MUTUO ACUERDO</span>
            <div class="causal-caja-cuadrada">
              {{ datosSolicitud.causalTerminacion === 'LIQUIDACION_ANTICIPADA' ? 'X' : '' }}
            </div>
          </div>
          <div class="causal-item">
            <span class="causal-nombre">TERMINACIÓN<br />UNILATERAL</span>
            <div class="causal-caja-cuadrada">
              {{ datosSolicitud.causalTerminacion === 'TERMINACION_UNILATERAL' ? 'X' : '' }}
            </div>
          </div>
        </div>

        <!-- Tabla de Dependencias Oficial (14 filas exactas de la foto) -->
        <div class="tabla-dep">
          <div class="tr-head">
            <div class="th-dep">DEPENDENCIA SENA</div>
            <div class="th-marca">Marcar<br />con x</div>
            <div class="th-resp-wrap">
              <div class="th-resp-top">RESPONSABLES</div>
              <div class="th-resp-sub">
                <div class="th-nombres">NOMBRES Y APELLIDOS</div>
                <div class="th-firma">FIRMA</div>
              </div>
            </div>
          </div>

          <!-- 14 Filas Oficiales GCCON-F-088 con soporte para firmas gráficas de área -->
          <div v-for="fila in filasDependencias" :key="fila.id" class="tr-row">
            <div class="td-dep" v-html="fila.dependencia"></div>
            <div class="td-marca">{{ fila.marca }}</div>
            <div class="td-nombres" v-html="fila.nombres"></div>
            <div
              class="td-firma"
              :class="{
                'cursor-pointer': puedeFirmarFila(fila),
                'cursor-default': !puedeFirmarFila(fila),
              }"
              @click="puedeFirmarFila(fila) ? abrirModalFirmaFila(fila) : null"
              :title="
                firmasTabla[fila.id]
                  ? 'Firma registrada de ' + fila.nombres
                  : puedeFirmarFila(fila)
                    ? 'Clic para estampar tu firma como responsable de esta dependencia'
                    : 'Firma reservada exclusivamente para ' + fila.nombres
              "
            >
              <img
                v-if="firmasTabla[fila.id]"
                :src="firmasTabla[fila.id]"
                :alt="'Firma ' + fila.nombres"
                class="img-firma-tabla"
              />
              <div v-else-if="puedeFirmarFila(fila)" class="btn-firmar-fila no-print">
                <span class="texto-firmar-fila">+ firmar</span>
              </div>
              <div v-else class="texto-pendiente-fila no-print">
                <span>Pendiente</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Sección Inferior: Elementos faltantes, Otros y Firma del Contratista -->
        <div class="seccion-inferior">
          <div class="fila-elementos">
            ELEMENTOS FALTANTES U OBLIGACIONES PENDIENTES (Relacionar con su respectivo valor)
          </div>
          <div class="espacio-elementos">
            <div v-if="listaNovedadesCertificado.length > 0" class="lista-elementos-pendientes">
              <div
                v-for="(nov, idx) in listaNovedadesCertificado"
                :key="idx"
                class="item-novedad-cert"
              >
                • <strong>{{ nov.dependencia }}:</strong> {{ nov.motivo }}
              </div>
            </div>
          </div>

          <div class="fila-otros-inf">
            <span class="otros-label">OTROS :</span>
            <span class="otros-puntos"></span>
          </div>

          <div class="linea-separador-inf"></div>

          <div class="zona-firma-inf">
            <div
              class="caja-firma-contratista"
              :class="{
                'cursor-pointer': esContratista && datosSolicitud.estado !== 'Rechazado',
                'cursor-default': !esContratista,
                'cursor-not-allowed': esContratista && datosSolicitud.estado === 'Rechazado',
              }"
              @click="esContratista ? abrirModalFirma() : null"
              :title="
                datosSolicitud.estado === 'Rechazado'
                  ? 'Firma retenida: solicitud rechazada por novedades pendientes'
                  : esContratista
                    ? 'Clic para estampar, cambiar o ajustar la firma del contratista'
                    : 'Firma reservada exclusivamente para el Contratista'
              "
            >
              <div
                v-if="firmaGuardada && datosSolicitud.estado !== 'Rechazado'"
                class="contenedor-firma-img"
              >
                <img :src="firmaGuardada" alt="Firma del Contratista" class="img-firma-estampada" />
                <q-tooltip v-if="esContratista"
                  >Clic para editar, agrandar o ajustar tu firma</q-tooltip
                >
              </div>
              <div v-else class="contenedor-firma-placeholder no-print">
                <q-btn
                  v-if="datosSolicitud.estado === 'Rechazado'"
                  flat
                  dense
                  size="xs"
                  color="negative"
                  icon="lock"
                  label="Firma bloqueada (Rechazado)"
                />
                <q-btn
                  v-else-if="esContratista"
                  flat
                  dense
                  size="xs"
                  color="primary"
                  icon="draw"
                  label="Clic para firmar (Contratista)"
                />
                <span v-else class="text-caption text-grey-6 text-italic">
                  Pendiente de firma del contratista
                </span>
              </div>
              <div class="linea-firma-sola"></div>
              <div class="texto-firma-sola">Firma del Contratista</div>
            </div>
          </div>

          <div class="linea-separador-inf"></div>
        </div>
      </div>
    </div>

    <!-- Diálogo para Pegar o Subir Firma directamente desde el Certificado -->
    <q-dialog v-model="dialogoFirma" persistent>
      <q-card style="min-width: 480px; max-width: 90vw">
        <q-card-section class="bg-primary text-white row items-center justify-between">
          <div class="text-h6">
            <q-icon name="edit_note" class="q-mr-sm" />
            {{ firmandoFila ? `Firma: ${firmandoFila.nombres}` : 'Firma del Contratista' }}
          </div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-md">
          <div class="text-caption text-grey-8 q-mb-sm">
            {{
              firmandoFila
                ? `Estampando firma para ${firmandoFila.nombres}. Pegue con Ctrl + V, cárguela como imagen o dibújela con el lápiz.`
                : 'Pegue su firma con Ctrl + V, cárguela como imagen o trácela en el recuadro. Se estampará directamente en este certificado.'
            }}
          </div>
          <FirmaCanvas ref="canvasRef" />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn
            color="positive"
            icon="verified"
            label="Estampar en Certificado"
            @click="guardarFirmaCertificado"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Diálogo para Editar y Guardar los Datos del Certificado GCCON-F-088 -->
    <q-dialog v-model="dialogoEditarDatos" persistent>
      <q-card style="min-width: 650px; max-width: 95vw; border-radius: 12px">
        <q-card-section class="bg-primary text-white row items-center justify-between q-py-md">
          <div class="text-h6 text-weight-bold">
            <q-icon name="edit_document" class="q-mr-sm" />
            Editar Información del Certificado GCCON-F-088
          </div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-lg scroll" style="max-height: 75vh">
          <div class="text-caption text-grey-8 q-mb-md">
            Esta información se guardará permanentemente para este usuario y se reflejará de forma
            exacta en el certificado impreso.
          </div>

          <!-- Clasificación de la Información -->
          <div class="q-mb-md">
            <div class="text-subtitle2 text-weight-bold text-dark q-mb-xs">
              Clasificación de la Información:
            </div>
            <q-btn-toggle
              v-model="formularioEdicion.clasificacion"
              spread
              no-caps
              rounded
              unelevated
              toggle-color="primary"
              color="grey-3"
              text-color="dark"
              :options="[
                { label: 'Pública', value: 'Publica' },
                { label: 'Pública Clasificada', value: 'Publica Clasificada' },
                { label: 'Pública Reservada', value: 'Publica Reservada' },
              ]"
            />
          </div>

          <q-separator class="q-my-md" />

          <!-- Datos del Contratista -->
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-7">
              <q-input
                v-model="formularioEdicion.contratista"
                label="Nombres y Apellidos del Contratista *"
                outlined
                dense
              >
                <template #prepend>
                  <q-icon name="person" color="primary" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-5">
              <q-input
                v-model="formularioEdicion.identificacion"
                label="Identificación / Cédula *"
                outlined
                dense
              >
                <template #prepend>
                  <q-icon name="badge" color="primary" />
                </template>
              </q-input>
            </div>
          </div>

          <!-- Ciudad, Regional y Fecha -->
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-5">
              <q-select
                v-model="formularioEdicion.ciudad"
                :options="ciudadesFiltradas"
                use-input
                fill-input
                hide-selected
                new-value-mode="add-unique"
                @filter="filtrarCiudades"
                label="Ciudad (Santander) *"
                outlined
                dense
              >
                <template #prepend>
                  <q-icon name="location_city" color="primary" />
                </template>
              </q-select>
            </div>
            <div class="col-12 col-md-4">
              <q-input v-model="formularioEdicion.regional" label="Regional *" outlined dense>
                <template #prepend>
                  <q-icon name="map" color="primary" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-3">
              <q-input
                v-model="formularioEdicion.fecha"
                label="Fecha de Expedición *"
                outlined
                dense
              >
                <template #prepend>
                  <q-icon name="event" color="primary" />
                </template>
              </q-input>
            </div>
          </div>

          <!-- Dirección u Oficina donde se ejecutó el contrato -->
          <div class="q-mb-md">
            <q-input
              v-model="formularioEdicion.direccion"
              label="Dirección u Oficina donde se ejecutó el contrato *"
              outlined
              dense
              hint="Ej. Gestión Tecnológica (TIC), Centro Agroturístico San Gil, Bienestar al Aprendiz, etc."
            >
              <template #prepend>
                <q-icon name="apartment" color="primary" />
              </template>
            </q-input>
          </div>

          <!-- Número y Fecha de Contrato -->
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="formularioEdicion.numeroContrato"
                label="Número de Contrato *"
                placeholder="Ej. CNT-2026-001"
                outlined
                dense
              >
                <template #prepend>
                  <q-icon name="description" color="primary" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="formularioEdicion.fechaContrato"
                label="Fecha de Inicio / Firma de Contrato"
                placeholder="Ej. 18/09/2026"
                outlined
                dense
              >
                <template #prepend>
                  <q-icon name="calendar_today" color="primary" />
                </template>
              </q-input>
            </div>
          </div>

          <q-separator class="q-my-md" />

          <!-- Causal de Terminación del Contrato -->
          <div class="q-mb-sm">
            <div class="text-subtitle2 text-weight-bold text-dark q-mb-sm">
              Causal de Terminación del Contrato:
            </div>
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6">
                <q-radio
                  v-model="formularioEdicion.causalTerminacion"
                  val="LIQUIDACION_MUTUO_ACUERDO"
                  label="Liquidación por Mutuo Acuerdo"
                  dense
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-radio
                  v-model="formularioEdicion.causalTerminacion"
                  val="CESION"
                  label="Cesión"
                  dense
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-radio
                  v-model="formularioEdicion.causalTerminacion"
                  val="LIQUIDACION_ANTICIPADA"
                  label="Liquidación Anticipada por Mutuo Acuerdo"
                  dense
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-radio
                  v-model="formularioEdicion.causalTerminacion"
                  val="TERMINACION_UNILATERAL"
                  label="Terminación Unilateral"
                  dense
                />
              </div>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md bg-grey-1">
          <q-btn flat label="Cancelar" color="grey-8" v-close-popup />
          <q-btn
            unelevated
            icon="save"
            label="Guardar y Actualizar Formato"
            color="positive"
            @click="guardarDatosFormato"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useSolicitudesStore } from '../stores/useSolicitudesStore.js'
import { useContratistasStore } from '../stores/useContratistasStore.js'
import { useAuthStore } from '../stores/authStore.js'
import api from '../services/api'
import FirmaCanvas from '../components/FirmaCanvas.vue'
import logoSena from '../images/logo-sena.png'

const $q = useQuasar()
const router = useRouter()
const route = useRoute()
const store = useSolicitudesStore()
const contratistasStore = useContratistasStore()
const auth = useAuthStore()

const esContratista = computed(() => auth.rolUsuario === 'CONTRATISTA')
const esResponsableArea = computed(() => auth.rolUsuario === 'RESPONSABLE_AREA')

const firmaGuardada = ref(null)
const dialogoFirma = ref(false)
const canvasRef = ref(null)
const filaParaFirmar = ref(null)

const firmasTabla = ref({})

const filasDependencias = ref([
  {
    id: 1,
    dependencia: 'GESTIÓN DE TIC',
    marca: 'X',
    nombres: 'Franklin Rolando Chacon Lopez',
  },
  {
    id: 2,
    dependencia: 'ADMINISTRACIÓN DE DOCUMENTOS',
    marca: 'X',
    nombres: 'Hilda Lucia Ramirez Alvarado',
  },
  {
    id: 3,
    dependencia:
      'ENTREGA CARNÉ (Al Supervisor del Contrato en las Regionales y Centros de Formación)<br>SECRETARÍA GENERAL',
    marca: 'X',
    nombres: 'Johon Fredy Sanabria Muñoz',
  },
  {
    id: 4,
    dependencia: 'ALMACÉN E INVENTARIOS',
    marca: 'X',
    nombres:
      'Generar reporte de https://miinventario.sena.edu.co/Inicio.aspx y anexar al formato, garantizando que no tiene elementos a su cargo.',
  },
  {
    id: 5,
    dependencia: 'SERVICIOS GENERALES, ADQUISICIONES<br>(Administración de edificio; Contratación)',
    marca: 'X',
    nombres: 'Juan David Silva Guierrez',
  },
  {
    id: 6,
    dependencia: 'CONTABILIDAD',
    marca: 'X',
    nombres: 'Zaida Leny Melgarejo Ballesteros',
  },
  {
    id: 7,
    dependencia: 'TESORERIA',
    marca: 'X',
    nombres: 'Nelcy Mabel Mayorga Pinto',
  },
  {
    id: 8,
    dependencia: 'COORDINACIÓN DE:<br>ÁREA/GRUPO/ ACADEMICA',
    marca: 'X',
    nombres: 'Johon Fredy Sanabria Muñoz',
  },
  {
    id: 9,
    dependencia: 'BIBLIOTECA',
    marca: 'X',
    nombres: 'Andrea Juliana Celis Camacho / Yudith Milagros Martinez Bautista',
  },
  {
    id: 10,
    dependencia: 'OTRO (LIDER SIGA)',
    marca: 'X',
    nombres: 'Zaida Jeleidy Garcia Jaimes',
  },
  {
    id: 11,
    dependencia: 'OTRO (AMINISTRACION EDUCATIVA)',
    marca: 'X',
    nombres: 'Erika Johana Gómez Verdugo',
  },
  {
    id: 12,
    dependencia: 'APOYO AL SEGUIMIENTO DE LOS PROCESOS ADMINISTRATIVOS Y NOVEDADES',
    marca: 'X',
    nombres: 'Nelson Fabian Duarte Peñaloza / Eileen Erlensi Hurtado Ariza',
  },
  {
    id: 13,
    dependencia: 'APOYO ETAPA PRODUCTIVA',
    marca: 'X',
    nombres: 'Karen Andrea Garcia Carreño',
  },
  {
    id: 14,
    dependencia: 'SUPERVISOR DE CONTRATO',
    marca: 'X',
    nombres: 'Johon Fredy Sanabria Muñoz',
  },
])

function abrirModalFirma() {
  if (!esContratista.value) {
    $q.notify({
      type: 'warning',
      message: 'Esta firma corresponde exclusivamente al Contratista.',
      icon: 'lock',
    })
    return
  }
  filaParaFirmar.value = null
  if (datosSolicitud.value.estado === 'Rechazado') {
    $q.dialog({
      title: 'Firma No Habilitada',
      message: `No es posible firmar este certificado de paz y salvo porque la solicitud se encuentra en estado RECHAZADO por las dependencias.

Motivo de rechazo / novedades:
"${datosSolicitud.value.observacionRechazo || 'Presenta novedades o bienes pendientes por subsanar ante las dependencias.'}"

Para poder firmar, debe devolver o subsanar los requerimientos y solicitar la reactivación a los responsables de área.`,
      color: 'negative',
      icon: 'block',
      ok: {
        label: 'Entendido',
        color: 'negative',
        unelevated: true,
      },
    })
    return
  }
  dialogoFirma.value = true
  if (firmaGuardada.value) {
    nextTick(() => {
      if (canvasRef.value && typeof canvasRef.value.cargarDataUrl === 'function') {
        canvasRef.value.cargarDataUrl(firmaGuardada.value)
      }
    })
  }
}

function normalizarTexto(txt) {
  return (txt || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function puedeFirmarFila(fila) {
  if (!fila) return false
  if (datosSolicitud.value.estado === 'Rechazado') return false

  const u = auth.usuario
  if (!u) return false

  const rol = (auth.rolUsuario || '').toUpperCase()

  // 1. Fila 14 (SUPERVISOR DE CONTRATO): la firma el Supervisor
  if (fila.id === 14) {
    if (rol === 'SUPERVISOR') return true
  }

  // 2. Solo RESPONSABLE_AREA (o Supervisor en fila 14) puede firmar dependencias
  if (!esResponsableArea.value && (fila.id !== 14 || rol !== 'SUPERVISOR')) {
    return false
  }

  const nombreUsuario = normalizarTexto(u.nombre || u.nombre_completo)
  const correoUsuario = normalizarTexto(u.correo || u.correo_institucional)
  const depUsuario = normalizarTexto(u.dependencia)
  const cargoUsuario = normalizarTexto(u.cargo)
  const nombresFila = normalizarTexto(fila.nombres)

  // Coincidencia directa por correo institucional
  if (correoUsuario) {
    if (fila.id === 1 && (correoUsuario.includes('tic') || correoUsuario.includes('chacon')))
      return true
    if (fila.id === 2 && (correoUsuario.includes('document') || correoUsuario.includes('ramirez')))
      return true
    if (
      fila.id === 3 &&
      (correoUsuario.includes('secretaria') ||
        correoUsuario.includes('carne') ||
        correoUsuario.includes('sanabria'))
    )
      return true
    if (
      fila.id === 4 &&
      (correoUsuario.includes('almacen') || correoUsuario.includes('inventario'))
    )
      return true
    if (fila.id === 5 && (correoUsuario.includes('servicios') || correoUsuario.includes('silva')))
      return true
    if (fila.id === 6 && (correoUsuario.includes('contab') || correoUsuario.includes('melgarejo')))
      return true
    if (fila.id === 7 && (correoUsuario.includes('tesor') || correoUsuario.includes('mayorga')))
      return true
    if (
      fila.id === 8 &&
      (correoUsuario.includes('coordinac') || correoUsuario.includes('sanabria'))
    )
      return true
    if (
      fila.id === 9 &&
      (correoUsuario.includes('biblio') ||
        correoUsuario.includes('celis') ||
        correoUsuario.includes('martinez'))
    )
      return true
    if (
      fila.id === 10 &&
      (correoUsuario.includes('siga') ||
        correoUsuario.includes('garcia') ||
        correoUsuario.includes('jaimes'))
    )
      return true
    if (fila.id === 11 && (correoUsuario.includes('educat') || correoUsuario.includes('gomez')))
      return true
    if (
      fila.id === 12 &&
      (correoUsuario.includes('duarte') ||
        correoUsuario.includes('hurtado') ||
        correoUsuario.includes('novedad'))
    )
      return true
    if (
      fila.id === 13 &&
      (correoUsuario.includes('productiv') || correoUsuario.includes('carreno'))
    )
      return true
    if (
      fila.id === 14 &&
      (correoUsuario.includes('supervisor') || correoUsuario.includes('sanabria'))
    )
      return true
  }

  // Coincidencia por nombre del usuario contra los nombres de la fila
  if (nombreUsuario && nombresFila) {
    if (nombresFila.includes(nombreUsuario) || nombreUsuario.includes(nombresFila)) {
      return true
    }

    if (fila.id === 1 && (nombreUsuario.includes('franklin') || nombreUsuario.includes('chacon')))
      return true
    if (
      fila.id === 2 &&
      (nombreUsuario.includes('hilda') ||
        (nombreUsuario.includes('lucia') && nombreUsuario.includes('ramirez')))
    )
      return true
    if (fila.id === 3 && (nombreUsuario.includes('johon') || nombreUsuario.includes('sanabria')))
      return true
    if (fila.id === 4 && (nombreUsuario.includes('martha') || depUsuario.includes('almacen')))
      return true
    if (
      fila.id === 5 &&
      (nombreUsuario.includes('juan david') ||
        (nombreUsuario.includes('silva') &&
          (nombreUsuario.includes('guierrez') || nombreUsuario.includes('gutierrez'))))
    )
      return true
    if (
      fila.id === 6 &&
      (nombreUsuario.includes('zaida leny') ||
        (nombreUsuario.includes('zaida') && nombreUsuario.includes('melgarejo')))
    )
      return true
    if (fila.id === 7 && (nombreUsuario.includes('nelcy') || nombreUsuario.includes('mayorga')))
      return true
    if (fila.id === 8 && (nombreUsuario.includes('johon') || nombreUsuario.includes('sanabria')))
      return true
    if (
      fila.id === 9 &&
      (nombreUsuario.includes('andrea') ||
        nombreUsuario.includes('juliana') ||
        nombreUsuario.includes('celis') ||
        nombreUsuario.includes('yudith') ||
        nombreUsuario.includes('martinez') ||
        nombreUsuario.includes('biblioteca'))
    )
      return true
    if (
      fila.id === 10 &&
      (nombreUsuario.includes('zaida jeleidy') ||
        (nombreUsuario.includes('jeleidy') && nombreUsuario.includes('garcia')) ||
        (nombreUsuario.includes('zaida') && nombreUsuario.includes('jaimes')))
    )
      return true
    if (
      fila.id === 11 &&
      (nombreUsuario.includes('erika') ||
        (nombreUsuario.includes('johana') && nombreUsuario.includes('gomez')))
    )
      return true
    if (
      fila.id === 12 &&
      (nombreUsuario.includes('nelson') ||
        nombreUsuario.includes('duarte') ||
        nombreUsuario.includes('eileen') ||
        nombreUsuario.includes('erlensi') ||
        nombreUsuario.includes('hurtado'))
    )
      return true
    if (
      fila.id === 13 &&
      (nombreUsuario.includes('karen') ||
        (nombreUsuario.includes('andrea') && nombreUsuario.includes('carreno')))
    )
      return true
    if (fila.id === 14 && (nombreUsuario.includes('johon') || nombreUsuario.includes('sanabria')))
      return true
  }

  // Coincidencia por dependencia configurada en el perfil
  if (depUsuario) {
    if (
      fila.id === 1 &&
      (depUsuario.includes('tic') ||
        depUsuario.includes('tecnol') ||
        depUsuario.includes('sistema'))
    )
      return true
    if (fila.id === 2 && (depUsuario.includes('document') || depUsuario.includes('archivo')))
      return true
    if (fila.id === 3 && (depUsuario.includes('secretaria') || depUsuario.includes('carne')))
      return true
    if (fila.id === 4 && (depUsuario.includes('almacen') || depUsuario.includes('inventario')))
      return true
    if (
      fila.id === 5 &&
      (depUsuario.includes('servicios') ||
        depUsuario.includes('adquisic') ||
        depUsuario.includes('edificio'))
    )
      return true
    if (fila.id === 6 && depUsuario.includes('contab')) return true
    if (fila.id === 7 && depUsuario.includes('tesor')) return true
    if (fila.id === 8 && (depUsuario.includes('coordinac') || depUsuario.includes('academ')))
      return true
    if (fila.id === 9 && depUsuario.includes('biblio')) return true
    if (fila.id === 10 && (depUsuario.includes('siga') || depUsuario.includes('calidad')))
      return true
    if (fila.id === 11 && (depUsuario.includes('educat') || depUsuario.includes('admin educ')))
      return true
    if (fila.id === 12 && (depUsuario.includes('novedad') || depUsuario.includes('proceso admin')))
      return true
    if (fila.id === 13 && (depUsuario.includes('etapa') || depUsuario.includes('productiv')))
      return true
  }

  // Coincidencia por cargo
  if (cargoUsuario) {
    if (fila.id === 1 && (cargoUsuario.includes('tic') || cargoUsuario.includes('tecnol')))
      return true
    if (fila.id === 4 && (cargoUsuario.includes('almacen') || cargoUsuario.includes('inventario')))
      return true
    if (fila.id === 6 && cargoUsuario.includes('contab')) return true
    if (fila.id === 7 && cargoUsuario.includes('tesor')) return true
    if (fila.id === 9 && cargoUsuario.includes('biblio')) return true
    if (fila.id === 10 && cargoUsuario.includes('siga')) return true
  }

  // Caso especial: Usuario demo
  if (nombreUsuario.includes('demo') && rol === 'RESPONSABLE_AREA' && !depUsuario) {
    return fila.id === 1
  }

  return false
}

const miFilaParaFirmar = computed(() => {
  return filasDependencias.value.find((f) => puedeFirmarFila(f)) || null
})

function limpiarMiFirma() {
  if (miFilaParaFirmar.value) {
    delete firmasTabla.value[miFilaParaFirmar.value.id]
    const codigo = route.query.codigo || route.params.id
    if (codigo) {
      localStorage.setItem(`firmas_tabla_${codigo}`, JSON.stringify(firmasTabla.value))
    }
    $q.notify({
      type: 'info',
      message: 'Firma de tu área removida.',
    })
  }
}

function abrirModalFirmaFila(fila) {
  if (!puedeFirmarFila(fila)) {
    $q.notify({
      type: 'warning',
      message: `Esta firma corresponde exclusivamente a ${fila.nombres} (${fila.dependencia.replace(/<[^>]*>/g, ' ')}).`,
      icon: 'lock',
    })
    return
  }
  if (datosSolicitud.value.estado === 'Rechazado') {
    $q.dialog({
      title: 'Firma No Habilitada',
      message: 'No es posible firmar dependencias en una solicitud que se encuentra rechazada.',
      color: 'negative',
      icon: 'block',
    })
    return
  }
  filaParaFirmar.value = fila
  dialogoFirma.value = true
  if (firmasTabla.value[fila.id]) {
    nextTick(() => {
      if (canvasRef.value && typeof canvasRef.value.cargarDataUrl === 'function') {
        canvasRef.value.cargarDataUrl(firmasTabla.value[fila.id])
      }
    })
  }
}

function guardarFirmaCertificado() {
  if (!canvasRef.value) return
  const dataUrl = canvasRef.value.exportarBase64()
  const codigo = route.query.codigo || route.params.id

  if (filaParaFirmar.value) {
    firmasTabla.value[filaParaFirmar.value.id] = dataUrl
    if (codigo) {
      localStorage.setItem(`firmas_tabla_${codigo}`, JSON.stringify(firmasTabla.value))
    }
    filaParaFirmar.value = null
  } else {
    firmaGuardada.value = dataUrl
    if (codigo) {
      localStorage.setItem(`firma_${codigo}`, dataUrl)
    }
    localStorage.setItem('ultima_firma', dataUrl)

    if (datosSolicitud.value.estado !== 'Rechazado') {
      datosSolicitud.value.estado = 'Firmado'
      datosSolicitud.value.observacionRechazo = ''
      datosSolicitud.value.novedades = []
      datosSolicitud.value.bienesFaltantes = []
      if (codigo) {
        localStorage.removeItem(`novedad_${codigo}`)
      }
      if (typeof store.cambiarEstado === 'function') {
        store.cambiarEstado(codigo, 'Firmado')
      }
    }
  }
  dialogoFirma.value = false
}

const listaCiudadesSantander = [
  'San Gil',
  'Socorro',
  'Bucaramanga',
  'Floridablanca',
  'Girón',
  'Piedecuesta',
  'Barrancabermeja',
  'Barbosa',
  'Vélez',
  'Charalá',
  'Málaga',
  'Zapatoca',
  'Oiba',
  'Pinchote',
  'Curití',
  'Barichara',
  'Aratoca',
  'Valle de San José',
  'Mogotes',
  'San Joaquín',
  'Onzaga',
  'Simacota',
  'Suaita',
  'Palmas del Socorro',
  'Villanueva',
  'Cabrera',
  'Guavatá',
  'Puente Nacional',
  'Cimitarra',
  'Lebrija',
  'Rionegro',
  'Sabana de Torres',
  'San Vicente de Chucurí',
  'El Playón',
  'Matanza',
  'Suratá',
  'California',
  'Vetas',
]

const ciudadesFiltradas = ref([...listaCiudadesSantander])

function filtrarCiudades(val, update) {
  if (val === '') {
    update(() => {
      ciudadesFiltradas.value = listaCiudadesSantander
    })
    return
  }

  update(() => {
    const aguja = val.toLowerCase()
    ciudadesFiltradas.value = listaCiudadesSantander.filter(
      (v) => v.toLowerCase().indexOf(aguja) > -1,
    )
  })
}

const datosSolicitud = ref({
  contratista: '',
  identificacion: '',
  ciudad: 'San Gil',
  fecha: new Date().toLocaleDateString('es-CO'),
  regional: 'Santander',
  direccion: 'Gestión Tecnológica (TIC)',
  contrato: '',
  numeroContrato: '',
  fechaContrato: '',
  causalTerminacion: 'LIQUIDACION_MUTUO_ACUERDO',
  clasificacion: 'Publica',
  responsable: '',
  estado: 'En revisión',
  observacionRechazo: '',
  dependenciaRechazo: '',
  novedades: [],
  bienesFaltantes: [],
  firmas: [],
})

const dialogoEditarDatos = ref(false)
const formularioEdicion = ref({
  contratista: '',
  identificacion: '',
  ciudad: 'San Gil',
  fecha: '',
  regional: 'Santander',
  direccion: '',
  numeroContrato: '',
  fechaContrato: '',
  causalTerminacion: 'LIQUIDACION_MUTUO_ACUERDO',
  clasificacion: 'Publica',
})

function abrirModalEditarDatos() {
  const ciudadActual = datosSolicitud.value.ciudad
  const regionalActual = datosSolicitud.value.regional

  let idenActual = datosSolicitud.value.identificacion || ''
  if (!idenActual || idenActual === '—') {
    const nomCon = (datosSolicitud.value.contratista || '').trim().toLowerCase()
    const cMatch = contratistasStore.contratistas?.find(
      (c) => (c.nombre || '').trim().toLowerCase() === nomCon,
    )
    if (cMatch?.documento) {
      idenActual = cMatch.documento
    } else if (
      auth.usuario?.documento &&
      (auth.rolUsuario === 'CONTRATISTA' ||
        (auth.usuario?.nombre || '').trim().toLowerCase() === nomCon)
    ) {
      idenActual = auth.usuario.documento
    } else if (auth.usuario?.identificacion) {
      idenActual = auth.usuario.identificacion
    }
  }

  formularioEdicion.value = {
    contratista: datosSolicitud.value.contratista || '',
    identificacion: idenActual,
    ciudad: !ciudadActual || ciudadActual === 'Ibagué' ? 'San Gil' : ciudadActual,
    fecha: datosSolicitud.value.fecha || new Date().toISOString().slice(0, 10),
    regional: !regionalActual || regionalActual === 'Tolima' ? 'Santander' : regionalActual,
    direccion: datosSolicitud.value.direccion || '',
    numeroContrato: datosSolicitud.value.numeroContrato || datosSolicitud.value.contrato || '',
    fechaContrato: datosSolicitud.value.fechaContrato || '',
    causalTerminacion: datosSolicitud.value.causalTerminacion || 'LIQUIDACION_MUTUO_ACUERDO',
    clasificacion: datosSolicitud.value.clasificacion || 'Publica',
  }
  ciudadesFiltradas.value = [...listaCiudadesSantander]
  dialogoEditarDatos.value = true
}

function guardarDatosFormato() {
  const idenLimpia = (formularioEdicion.value.identificacion || '').trim()

  datosSolicitud.value = {
    ...datosSolicitud.value,
    ...formularioEdicion.value,
    identificacion: idenLimpia,
    contrato: formularioEdicion.value.numeroContrato
      ? `${formularioEdicion.value.numeroContrato} — ${formularioEdicion.value.fechaContrato || datosSolicitud.value.fecha}`
      : datosSolicitud.value.contrato,
  }

  const codigo = route.query.codigo || route.params.id || datosSolicitud.value.contratista

  // 1. Guardar en localStorage para este usuario / contrato
  localStorage.setItem(`certificado_datos_${codigo}`, JSON.stringify(datosSolicitud.value))
  if (idenLimpia) {
    localStorage.setItem(`certificado_identificacion_${codigo}`, idenLimpia)
  }
  if (datosSolicitud.value.contratista) {
    localStorage.setItem(
      `certificado_datos_${datosSolicitud.value.contratista.toLowerCase().trim()}`,
      JSON.stringify(datosSolicitud.value),
    )
    if (idenLimpia) {
      localStorage.setItem(
        `certificado_identificacion_${datosSolicitud.value.contratista.toLowerCase().trim()}`,
        idenLimpia,
      )
    }
  }
  if (idenLimpia) {
    localStorage.setItem(`certificado_datos_${idenLimpia}`, JSON.stringify(datosSolicitud.value))
    localStorage.setItem(`certificado_identificacion_${idenLimpia}`, idenLimpia)
  }
  if (datosSolicitud.value.numeroContrato) {
    localStorage.setItem(
      `certificado_datos_${datosSolicitud.value.numeroContrato.toLowerCase().trim()}`,
      JSON.stringify(datosSolicitud.value),
    )
  }

  // 2. Sincronizar con el store de solicitudes
  if (Array.isArray(store.solicitudes)) {
    const item = store.solicitudes.find(
      (s) =>
        s._id === codigo ||
        s.id === codigo ||
        s.numeroSolicitud === codigo ||
        s.numeroContrato === codigo ||
        s.contrato === codigo ||
        (s.contratista &&
          s.contratista.toLowerCase().trim() ===
            datosSolicitud.value.contratista.toLowerCase().trim()),
    )
    if (item) {
      item.contratista = datosSolicitud.value.contratista
      item.nombreContratista = datosSolicitud.value.contratista
      item.identificacion = datosSolicitud.value.identificacion
      item.documentoContratista = datosSolicitud.value.identificacion
      item.ciudad = datosSolicitud.value.ciudad
      item.fecha = datosSolicitud.value.fecha
      item.regional = datosSolicitud.value.regional
      item.direccion = datosSolicitud.value.direccion
      item.dependencia = datosSolicitud.value.direccion
      item.numeroContrato = datosSolicitud.value.numeroContrato
      item.fechaContrato = datosSolicitud.value.fechaContrato
      item.causalTerminacion = datosSolicitud.value.causalTerminacion
      item.clasificacion = datosSolicitud.value.clasificacion
    }
  }

  dialogoEditarDatos.value = false
  $q.notify({
    type: 'positive',
    message: 'Información del formato guardada exitosamente para este usuario.',
    icon: 'save',
  })
}

const listaNovedadesCertificado = computed(() => {
  const est = (datosSolicitud.value.estado || '').toLowerCase().trim()

  // Si la solicitud está FIRMADA, APROBADA o en PAZ Y SALVO VIGENTE, el contratista está a paz y salvo:
  // NO deben aparecer novedades ni observaciones de rechazo en el recuadro de obligaciones pendientes.
  if (
    est === 'firmado' ||
    est === 'aprobado' ||
    est === 'vigente' ||
    est === 'finalizado' ||
    est === 'paz y salvo'
  ) {
    return []
  }

  // Las novedades u observaciones de rechazo solo deben mostrarse si la solicitud está formalmente en 'Rechazado'
  if (est !== 'rechazado') {
    return []
  }

  if (Array.isArray(datosSolicitud.value.novedades) && datosSolicitud.value.novedades.length > 0) {
    return datosSolicitud.value.novedades
  }
  if (
    Array.isArray(datosSolicitud.value.bienesFaltantes) &&
    datosSolicitud.value.bienesFaltantes.length > 0
  ) {
    return datosSolicitud.value.bienesFaltantes.map((b) => ({
      dependencia: b.dependencia || 'Almacén e Inventarios',
      motivo: `${b.descripcion || 'Bien pendiente'} (${b.codigo_inventario || 'S/C'})`,
    }))
  }
  if (datosSolicitud.value.observacionRechazo) {
    return [
      {
        dependencia:
          datosSolicitud.value.dependenciaRechazo ||
          datosSolicitud.value.direccion ||
          'Área Evaluadora',
        motivo: datosSolicitud.value.observacionRechazo,
      },
    ]
  }
  return []
})

onMounted(async () => {
  if (contratistasStore.contratistas.length === 0 && contratistasStore.cargarContratistas) {
    await contratistasStore.cargarContratistas()
  }

  const codigo =
    route.query.codigo ||
    route.params.id ||
    auth.usuario?.numeroContrato ||
    auth.usuario?.nombre ||
    ''
  if (codigo) {
    const f = localStorage.getItem(`firma_${codigo}`) || localStorage.getItem('ultima_firma')
    if (f) firmaGuardada.value = f

    const ft = localStorage.getItem(`firmas_tabla_${codigo}`)
    if (ft) {
      try {
        firmasTabla.value = JSON.parse(ft)
      } catch (e) {
        console.warn('Error al parsear firmas tabla:', e)
      }
    }

    // 1. Verificar si hay datos guardados previamente para este código o contratista
    const claveStorage = `certificado_datos_${String(codigo).toLowerCase().trim()}`
    const datosGuardados =
      localStorage.getItem(`certificado_datos_${codigo}`) || localStorage.getItem(claveStorage)
    if (datosGuardados) {
      try {
        const parsed = JSON.parse(datosGuardados)
        datosSolicitud.value = {
          ...datosSolicitud.value,
          ...parsed,
        }
      } catch (e) {
        console.warn('Error al parsear datos guardados del certificado:', e)
      }
    }

    let encontrada = null
    if (typeof store.obtenerPorCodigo === 'function') {
      encontrada = store.obtenerPorCodigo(codigo)
    } else if (Array.isArray(store.solicitudes)) {
      encontrada = store.solicitudes.find(
        (s) =>
          (s.numeroSolicitud || s.solicitud || s.codigo || s.numeroContrato || s.contrato) ===
          codigo,
      )
    }

    if (encontrada) {
      const numContrato = encontrada.numeroContrato || encontrada.contrato || codigo
      let fchContrato = encontrada.fechaContrato || ''
      if (!fchContrato && /^\d{2}[/-]\d{2}[/-]\d{2,4}$/.test(String(numContrato).trim())) {
        fchContrato = numContrato
      }

      const nomContratista =
        datosSolicitud.value.contratista ||
        encontrada.contratista ||
        encontrada.nombreContratista ||
        'Paula Valentina Rache Fonseca'

      // Resolver identificación
      let docResuelto = ''
      const idenStorage =
        localStorage.getItem(`certificado_identificacion_${codigo}`) ||
        localStorage.getItem(`certificado_identificacion_${String(codigo).toLowerCase().trim()}`) ||
        (nomContratista
          ? localStorage.getItem(
              `certificado_identificacion_${nomContratista.toLowerCase().trim()}`,
            )
          : null)
      if (idenStorage && idenStorage !== '—' && idenStorage !== '1098765432') {
        docResuelto = idenStorage
      }

      if (
        !docResuelto &&
        datosSolicitud.value.identificacion &&
        datosSolicitud.value.identificacion !== '—' &&
        datosSolicitud.value.identificacion !== '1098765432'
      ) {
        docResuelto = datosSolicitud.value.identificacion
      }

      if (!docResuelto) {
        if (
          encontrada.identificacion &&
          encontrada.identificacion !== '—' &&
          encontrada.identificacion !== '1098765432'
        ) {
          docResuelto = encontrada.identificacion
        } else if (
          encontrada.documento &&
          encontrada.documento !== '—' &&
          encontrada.documento !== '1098765432'
        ) {
          docResuelto = encontrada.documento
        } else if (
          encontrada.documentoContratista &&
          encontrada.documentoContratista !== '—' &&
          encontrada.documentoContratista !== '1098765432'
        ) {
          docResuelto = encontrada.documentoContratista
        }
      }

      if (!docResuelto || docResuelto === '—' || docResuelto === '1098765432') {
        const conMatch = contratistasStore.contratistas?.find(
          (c) => (c.nombre || '').trim().toLowerCase() === nomContratista.trim().toLowerCase(),
        )
        if (conMatch?.documento) {
          docResuelto = conMatch.documento
        } else if (
          auth.usuario?.documento &&
          (auth.rolUsuario === 'CONTRATISTA' ||
            (auth.usuario?.nombre || '').trim().toLowerCase() ===
              nomContratista.trim().toLowerCase())
        ) {
          docResuelto = auth.usuario.documento
        } else if (auth.usuario?.identificacion) {
          docResuelto = auth.usuario.identificacion
        }
      }

      if (!docResuelto || docResuelto === '—') {
        if (encontrada.identificacion && encontrada.identificacion !== '—')
          docResuelto = encontrada.identificacion
        else if (encontrada.documento && encontrada.documento !== '—')
          docResuelto = encontrada.documento
        else if (encontrada.documentoContratista && encontrada.documentoContratista !== '—')
          docResuelto = encontrada.documentoContratista
        else docResuelto = '1098765432'
      }

      datosSolicitud.value = {
        contratista: nomContratista,
        identificacion: docResuelto,
        ciudad:
          !datosSolicitud.value.ciudad || datosSolicitud.value.ciudad === 'Ibagué'
            ? encontrada.ciudad && encontrada.ciudad !== 'Ibagué'
              ? encontrada.ciudad
              : 'San Gil'
            : datosSolicitud.value.ciudad,
        fecha:
          datosSolicitud.value.fecha || encontrada.fecha || new Date().toLocaleDateString('es-CO'),
        regional:
          !datosSolicitud.value.regional || datosSolicitud.value.regional === 'Tolima'
            ? encontrada.regional && encontrada.regional !== 'Tolima'
              ? encontrada.regional
              : 'Santander'
            : datosSolicitud.value.regional,
        direccion: (
          datosSolicitud.value.direccion ||
          encontrada.direccion ||
          encontrada.dependencia ||
          'Gestión Tecnológica (TIC)'
        ).replace(/\s*\/\s*Contratista/i, ''),
        numeroContrato:
          datosSolicitud.value.numeroContrato ||
          (numContrato && !numContrato.includes('/') ? numContrato : 'CNT-2026-001'),
        fechaContrato: datosSolicitud.value.fechaContrato || fchContrato || '18/09/2026',
        contrato: numContrato,
        causalTerminacion:
          datosSolicitud.value.causalTerminacion ||
          encontrada.causalTerminacion ||
          'LIQUIDACION_MUTUO_ACUERDO',
        clasificacion: datosSolicitud.value.clasificacion || encontrada.clasificacion || 'Publica',
        responsable: encontrada.responsable || encontrada.supervisor || 'Ing. Carlos Supervisor',
        estado: encontrada.estado || 'En revisión',
        observacionRechazo:
          encontrada.observacionRechazo || encontrada.observaciones_supervisor || '',
        dependenciaRechazo: encontrada.dependenciaRechazo || '',
        novedades: encontrada.novedades || [],
        bienesFaltantes: encontrada.bienesFaltantes || [],
        firmas: encontrada.firmas || [],
      }
    } else {
      try {
        const resp = await api.get('/contratos')
        const lista = Array.isArray(resp.data) ? resp.data : resp.data?.contratos || []
        const c = lista.find(
          (item) =>
            item._id === codigo ||
            item.numero_contrato === codigo ||
            item.id === codigo ||
            item.numero === codigo,
        )
        if (c) {
          const nomApi =
            datosSolicitud.value.contratista ||
            c.nombre_contratista ||
            c.contratista ||
            'Paula Valentina Rache Fonseca'
          let docApi =
            (datosSolicitud.value.identificacion &&
            datosSolicitud.value.identificacion !== '—' &&
            datosSolicitud.value.identificacion !== '1098765432'
              ? datosSolicitud.value.identificacion
              : '') ||
            c.documento_contratista ||
            c.identificacion ||
            c.documento ||
            c.usuario?.documento ||
            ''
          if (!docApi || docApi === '—' || docApi === '1098765432') {
            const matchCt = contratistasStore.contratistas?.find(
              (ct) => (ct.nombre || '').trim().toLowerCase() === nomApi.trim().toLowerCase(),
            )
            if (matchCt?.documento) docApi = matchCt.documento
            else if (auth.usuario?.documento) docApi = auth.usuario.documento
            else if (auth.usuario?.identificacion) docApi = auth.usuario.identificacion
          }

          datosSolicitud.value = {
            ...datosSolicitud.value,
            contratista: nomApi,
            identificacion: docApi || '1098765432',
            ciudad:
              !datosSolicitud.value.ciudad || datosSolicitud.value.ciudad === 'Ibagué'
                ? c.ciudad && c.ciudad !== 'Ibagué'
                  ? c.ciudad
                  : 'San Gil'
                : datosSolicitud.value.ciudad,
            fecha: datosSolicitud.value.fecha || new Date().toLocaleDateString('es-CO'),
            regional:
              !datosSolicitud.value.regional || datosSolicitud.value.regional === 'Tolima'
                ? c.regional && c.regional !== 'Tolima'
                  ? c.regional
                  : 'Santander'
                : datosSolicitud.value.regional,
            direccion: (
              datosSolicitud.value.direccion ||
              c.dependencia?.nombre_dependencia ||
              'Gestión Tecnológica (TIC)'
            ).replace(/\s*\/\s*Contratista/i, ''),
            numeroContrato: datosSolicitud.value.numeroContrato || c.numero_contrato || codigo,
            fechaContrato: datosSolicitud.value.fechaContrato || '18/09/2026',
            contrato: c.numero_contrato || codigo,
            responsable: c.supervisor || 'Ing. Carlos Supervisor',
            estado: c.estado || 'En revisión',
            observacionRechazo: c.observaciones_supervisor || '',
            bienesFaltantes: [],
            firmas: [],
          }
        }
      } catch (err) {
        console.warn('Carga diferida contrato:', err.message)
      }

      // Si aún faltan datos de contratista, buscar por usuario (e.g. 'stiven')
      try {
        const respUsuarios = await api.get('/usuarios?rol=Contratista')
        const listaUsuarios = Array.isArray(respUsuarios.data)
          ? respUsuarios.data
          : respUsuarios.data?.usuarios || []
        const u = listaUsuarios.find(
          (item) =>
            item._id === codigo ||
            item.id === codigo ||
            (item.nombre_completo &&
              item.nombre_completo.toLowerCase().trim() === String(codigo).toLowerCase().trim()) ||
            item.documento === codigo ||
            item.telefono === codigo,
        )
        if (u) {
          const nomLimpio = u.nombre_completo || u.nombre || codigo
          const docLimpio = u.documento || u.telefono || '1234567899'
          const depLimpia = (
            u.dependencia ||
            u.dependencia_id?.nombre_dependencia ||
            'Bienestar al Aprendiz'
          ).replace(/\s*\/\s*Contratista/i, '')
          const numCon =
            u.numero_contrato || (codigo && !codigo.includes('/') ? codigo : 'CNT-2026-001')
          const fchCon = u.createdAt
            ? new Date(u.createdAt).toLocaleDateString('es-CO')
            : codigo.includes('/')
              ? codigo
              : '18/09/2026'

          datosSolicitud.value = {
            ...datosSolicitud.value,
            contratista: datosSolicitud.value.contratista || nomLimpio,
            identificacion: datosSolicitud.value.identificacion || docLimpio,
            direccion: datosSolicitud.value.direccion || depLimpia,
            numeroContrato: datosSolicitud.value.numeroContrato || numCon,
            fechaContrato: datosSolicitud.value.fechaContrato || fchCon,
            contrato: `${numCon} — ${fchCon}`,
          }
        }
      } catch (errU) {
        console.warn('Búsqueda por contratista:', errU.message)
      }
    }

    // Verificación final de identificación si quedó vacía o placeholder
    if (
      !datosSolicitud.value.identificacion ||
      datosSolicitud.value.identificacion === '—' ||
      datosSolicitud.value.identificacion === '1098765432'
    ) {
      const nomFinal = (datosSolicitud.value.contratista || auth.usuario?.nombre || '')
        .trim()
        .toLowerCase()
      const conMatch = contratistasStore.contratistas?.find(
        (c) => (c.nombre || '').trim().toLowerCase() === nomFinal,
      )
      if (conMatch?.documento) {
        datosSolicitud.value.identificacion = conMatch.documento
      } else if (
        auth.usuario?.documento &&
        (auth.rolUsuario === 'CONTRATISTA' ||
          (auth.usuario?.nombre || '').trim().toLowerCase() === nomFinal)
      ) {
        datosSolicitud.value.identificacion = auth.usuario.documento
      } else if (auth.usuario?.identificacion) {
        datosSolicitud.value.identificacion = auth.usuario.identificacion
      }
    }

    // Si el certificado está firmado, aprobado o en paz y salvo, limpiar cualquier residuo de observaciones de rechazo
    const estLimpio = (datosSolicitud.value.estado || '').toLowerCase().trim()
    if (
      estLimpio === 'firmado' ||
      estLimpio === 'aprobado' ||
      estLimpio === 'vigente' ||
      estLimpio === 'finalizado' ||
      estLimpio === 'paz y salvo'
    ) {
      datosSolicitud.value.observacionRechazo = ''
      datosSolicitud.value.dependenciaRechazo = ''
      datosSolicitud.value.novedades = []
      datosSolicitud.value.bienesFaltantes = []
    }
  } else {
    const f = localStorage.getItem('ultima_firma')
    if (f) firmaGuardada.value = f
  }
})

function volver() {
  router.push({ name: 'solicitudes' })
}

function imprimir() {
  if (datosSolicitud.value.estado === 'Rechazado') {
    $q.dialog({
      title: 'Solicitud en Estado Rechazado',
      message: `Esta solicitud se encuentra RECHAZADA. El documento impreso incluirá la marca de agua que indica que es un borrador no válido como Paz y Salvo oficial.

Motivo registrado: "${datosSolicitud.value.observacionRechazo || 'Bienes o requerimientos pendientes en dependencias'}"

¿Desea imprimir únicamente como constancia informativa de borrador / novedades pendientes?`,
      icon: 'warning',
      color: 'warning',
      cancel: {
        label: 'Cancelar',
        flat: true,
        color: 'grey-8',
      },
      ok: {
        label: 'Imprimir como borrador',
        color: 'negative',
        unelevated: true,
      },
      persistent: true,
    }).onOk(() => {
      window.print()
    })
    return
  }
  window.print()
}
</script>

<style scoped>
.page-formato {
  background: #7a7a7a;
  min-height: 100vh;
  padding: 20px 10px 40px;
  font-family: Arial, Helvetica, sans-serif;
  color: #000000;
  box-sizing: border-box;
}

.toolbar {
  max-width: 820px;
  width: 100%;
  margin: 0 auto 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  padding: 8px 16px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  box-sizing: border-box;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
}

.documento-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 16px;
}

.banner-alerta-pantalla {
  max-width: 820px;
  margin: 0 auto;
}

.border-banner-rechazo {
  border: 1.5px solid #d32f2f;
}

.border-novedad-rechazo {
  border: 1px dashed #e57373;
}

.marca-agua-rechazado {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-30deg);
  font-size: 38px;
  font-weight: 900;
  color: rgba(211, 47, 47, 0.22);
  border: 4px dashed rgba(211, 47, 47, 0.35);
  padding: 10px 24px;
  border-radius: 8px;
  pointer-events: none;
  z-index: 100;
  text-align: center;
  letter-spacing: 2px;
  white-space: nowrap;
}

.documento {
  position: relative;
  width: 100%;
  max-width: 820px;
  min-width: 680px;
  margin: 0 auto;
  background: #ffffff;
  border: 1.5px solid #000000;
  box-sizing: border-box;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.35);
  flex-shrink: 0;
}

/* Encabezado simétrico: el logo queda 100% centrado sobre la barra PROCESO */
.encabezado-topo {
  display: grid;
  grid-template-columns: 120px 1fr 120px;
  align-items: stretch;
  border-bottom: 1.5px solid #000000;
  min-height: 72px;
}

.encabezado-spacer {
  width: 100%;
}

.logo-box {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 10px;
}

.logo-sena {
  height: 60px;
  width: auto;
  display: block;
}

.version-box {
  width: 100%;
  border-left: 1.5px solid #000000;
  display: flex;
  flex-direction: column;
}

.version-fila {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 10.5px;
  font-weight: 700;
  text-align: center;
  padding: 4px;
  line-height: 1.2;
}

.version-fila:first-child {
  border-bottom: 1px solid #000000;
}

/* Barras Negras y Blancas */
.barra-negra {
  background: #000000;
  color: #ffffff;
  font-weight: 800;
  font-size: 10.5px;
  text-align: center;
  padding: 3.5px 4px;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #000000;
}

.fila-blanca {
  background: #ffffff;
  color: #000000;
  font-weight: 800;
  font-size: 10.5px;
  text-align: center;
  padding: 4.5px 4px;
  border-bottom: 1px solid #000000;
  letter-spacing: 0.3px;
}

.texto-formato {
  font-size: 9.5px;
  padding: 5px 4px;
}

/* Clasificación de la Información */
.clasificacion-tabla {
  display: grid;
  grid-template-columns: 2.2fr 1fr 2.5fr 1fr 2.5fr 1fr;
  border-bottom: 1px solid #000000;
  background: #ffffff;
}

.clasif-col {
  padding: 3px 4px;
  font-size: 9.5px;
  font-weight: 800;
  text-align: center;
  border-right: 1px solid #000000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clasif-check {
  padding: 2px;
  font-size: 10.5px;
  font-weight: 800;
  text-align: center;
  border-right: 1px solid #000000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clasif-check:last-child {
  border-right: none;
}

/* Datos del Contratista - Exacto a Formato Oficial GCCON-F-088 */
.seccion-datos {
  border-bottom: 2px solid #000000;
  font-size: 8.5px;
  font-weight: 700;
  background: #ffffff;
}

.fila-contratista-1 {
  display: flex;
  border-bottom: 1px dotted #000000;
  min-height: 22px;
}

.celda-nombre-contratista {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 2.5px 6px;
  border-right: 1px dotted #000000;
}

.celda-identificacion-header {
  width: 22%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-weight: 800;
  padding: 2.5px 6px;
}

.fila-contratista-2 {
  display: flex;
  border-bottom: 1px dotted #000000;
  min-height: 22px;
}

.bloque-ciudad-fecha-regional {
  flex: 1;
  display: flex;
  border-right: 1px dotted #000000;
}

.celda-identificacion-valor {
  width: 22%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-weight: 700;
  padding: 2.5px 6px;
}

.celda-ciudad-lbl {
  width: 55px;
  flex-shrink: 0;
}

.celda-ciudad-val {
  flex: 1.2;
  border-right: 1px dotted #000000;
}

.celda-fecha-lbl {
  width: 50px;
  flex-shrink: 0;
}

.celda-fecha-val {
  flex: 1;
  border-right: 1px dotted #000000;
}

.celda-regional-lbl {
  width: 70px;
  flex-shrink: 0;
  border-right: 1px dotted #000000;
}

.celda-regional-val {
  flex: 1.5;
}

.fila-contratista-3 {
  display: flex;
  border-bottom: 1px dotted #000000;
  min-height: 22px;
}

.celda-direccion-lbl {
  width: 335px;
  flex-shrink: 0;
}

.celda-direccion-val {
  flex: 1;
}

.fila-contratista-4 {
  display: flex;
  min-height: 22px;
}

.celda-contrato-lbl {
  width: 225px;
  flex-shrink: 0;
}

.celda-contrato-val {
  flex: 1;
}

.celda-etiqueta {
  display: flex;
  align-items: center;
  padding: 2.5px 6px;
  border-right: 1px dotted #000000;
  font-weight: 800;
  white-space: nowrap;
}

.celda-valor {
  display: flex;
  align-items: center;
  padding: 2.5px 6px;
  font-weight: 700;
}

.etiqueta-form {
  font-weight: 800;
  margin-right: 6px;
  white-space: nowrap;
}

.valor-form {
  font-weight: 700;
}

/* Causal de Terminación */
.titulo-causal {
  text-align: center;
  font-size: 11px;
  font-weight: 800;
  padding: 8px 4px 5px;
  letter-spacing: 0.5px;
}

.fila-causales {
  display: grid;
  grid-template-columns: 1.25fr 1.3fr 1.35fr 1.1fr;
  padding: 3px 6px 8px;
  align-items: center;
  gap: 6px;
  border-bottom: 1.5px solid #000000;
}

.causal-item {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 5px;
}

.causal-nombre {
  font-size: 7.5px;
  font-weight: 800;
  text-align: right;
  line-height: 1.15;
}

.causal-caja-cuadrada {
  width: 26px;
  height: 26px;
  border: 1.5px solid #000000;
  background: #ffffff;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 14px;
}

.causal-caja-rect {
  width: 65px;
  height: 26px;
  border: 1.5px solid #000000;
  background: #ffffff;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 14px;
}

/* Tabla de Dependencias */
.tabla-dep {
  border-bottom: 1.5px solid #000000;
  font-size: 7.5px;
  font-weight: 700;
}

.tr-head {
  display: grid;
  grid-template-columns: 155px 44px 1fr;
  border-bottom: 1.5px solid #000000;
  min-height: 28px;
}

.th-dep {
  border-right: 1px solid #000000;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-weight: 800;
  font-size: 8px;
}

.th-marca {
  border-right: 1.5px solid #000000;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-weight: 800;
  font-size: 7px;
  line-height: 1.1;
}

.th-resp-wrap {
  display: flex;
  flex-direction: column;
}

.th-resp-top {
  text-align: center;
  padding: 2px;
  border-bottom: 1px solid #000000;
  font-size: 7.5px;
  font-weight: 800;
}

.th-resp-sub {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  flex: 1;
}

.th-nombres {
  border-right: 1px solid #000000;
  padding: 2px 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 7.5px;
  font-weight: 800;
}

.th-firma {
  padding: 2px 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 7.5px;
  font-weight: 800;
}

.tr-row {
  display: grid;
  grid-template-columns: 155px 44px 1.4fr 1fr;
  border-bottom: 1px solid #000000;
  min-height: 18px;
}

.tr-row:last-child {
  border-bottom: none;
}

.td-dep {
  border-right: 1px solid #000000;
  padding: 2.5px 4px;
  display: flex;
  align-items: center;
  font-size: 7px;
  line-height: 1.15;
}

.td-marca {
  border-right: 1.5px solid #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 800;
}

.td-nombres {
  border-right: 1px solid #000000;
  padding: 2.5px 4px;
  display: flex;
  align-items: center;
  font-size: 7px;
  line-height: 1.15;
}

.td-firma {
  padding: 2px;
  min-height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.img-firma-tabla {
  max-width: 95px;
  max-height: 18px;
  object-fit: contain;
  display: block;
}

.btn-firmar-fila {
  display: inline-flex;
  align-items: center;
  color: #1976d2;
  font-size: 7px;
  font-weight: 700;
  opacity: 0.8;
}

.btn-firmar-fila:hover {
  opacity: 1;
  text-decoration: underline;
}

.texto-pendiente-fila {
  display: inline-flex;
  align-items: center;
  color: #9e9e9e;
  font-size: 7px;
  font-weight: 500;
  font-style: italic;
}

/* Sección Inferior */
.seccion-inferior {
  font-size: 7.5px;
  font-weight: 700;
}

.fila-elementos {
  padding: 4px 6px 0;
  font-size: 7.5px;
  font-weight: 700;
  letter-spacing: 0.1px;
}

.espacio-elementos {
  min-height: 22px;
  padding: 2px 6px;
}

.lista-elementos-pendientes {
  font-size: 7px;
  color: #c62828;
  line-height: 1.3;
}

.item-novedad-cert {
  margin-bottom: 2px;
}

.fila-otros-inf {
  display: flex;
  align-items: baseline;
  padding: 2px 6px 6px;
}

.otros-label {
  white-space: nowrap;
  margin-right: 4px;
  font-weight: 700;
  font-size: 7.5px;
}

.otros-puntos {
  flex: 1;
  border-bottom: 1px dotted #000000;
  height: 1px;
  margin-bottom: 2px;
}

.linea-separador-inf {
  border-bottom: 1.5px solid #000000;
  width: 100%;
}

.zona-firma-inf {
  min-height: 65px;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  padding: 8px 30px 10px 8px;
}

.caja-firma-contratista {
  width: 180px;
  text-align: center;
}

.contenedor-firma-img {
  width: 100%;
  height: 52px;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  margin-bottom: 2px;
}

.img-firma-estampada {
  max-width: 175px;
  max-height: 50px;
  object-fit: contain;
  transition: transform 0.15s ease;
}

.caja-firma-contratista:hover .img-firma-estampada {
  transform: scale(1.04);
}

.linea-firma-sola {
  width: 100%;
  border-bottom: 1.5px solid #000000;
  margin-bottom: 3px;
}

.texto-firma-sola {
  font-size: 7.5px;
  font-weight: 700;
  color: #000000;
  text-align: center;
}

/* ===================== IMPRESIÓN ===================== */
@media print {
  @page {
    size: letter portrait;
    margin: 6mm 8mm;
  }

  *,
  *::before,
  *::after {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    box-sizing: border-box;
  }

  :global(html),
  :global(body) {
    background: #ffffff !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  .toolbar,
  .no-print {
    display: none !important;
  }

  .page-formato {
    background: #ffffff !important;
    padding: 0 !important;
    margin: 0 !important;
    min-height: auto !important;
  }

  .documento-wrapper {
    overflow: visible !important;
    padding: 0 !important;
    display: block !important;
    max-width: none !important;
    width: 100% !important;
  }

  .documento {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    margin: 0 !important;
    border: 1.5px solid #000000 !important;
    box-shadow: none !important;
    background: #ffffff !important;
  }

  .encabezado-topo {
    grid-template-columns: 120px 1fr 120px !important;
  }

  .barra-negra {
    background: #000000 !important;
    color: #ffffff !important;
  }

  .causal-caja-cuadrada,
  .causal-caja-rect {
    border: 1.5px solid #000000 !important;
    background: #ffffff !important;
  }
}

@media (max-width: 600px) {
  .page-formato {
    padding: 8px 4px 16px;
  }
  .toolbar {
    padding: 6px 10px;
    margin-bottom: 8px;
  }
}
</style>
