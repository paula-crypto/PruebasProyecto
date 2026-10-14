<template>
  <q-page class="page-formato">
    <div class="toolbar no-print">
      <!-- Lado Izquierdo: Volver -->
      <div class="toolbar-left row items-center">
        <q-btn
          flat
          dense
          color="grey-9"
          icon="arrow_back"
          label="Volver"
          class="text-weight-bold q-px-sm"
          @click="volver"
        />
        <q-chip
          v-if="datosSolicitud.estado === 'Rechazado'"
          dense
          color="red-1"
          text-color="negative"
          icon="cancel"
          class="text-weight-bold q-px-sm q-ml-sm"
        >
          Rechazado
        </q-chip>
      </div>

      <!-- Lado Derecho: Acciones principales con estilo homogéneo, espaciadas y legibles -->
      <div class="toolbar-right row items-center q-gutter-md no-wrap">
        <q-btn
          v-if="
            miFilaParaFirmar &&
            datosSolicitud.estado !== 'Rechazado' &&
            !firmasTabla[miFilaParaFirmar.id]
          "
          unelevated
          dense
          color="blue-8"
          icon="history_edu"
          :label="'Firmar ' + (miFilaParaFirmar.id === 14 ? 'Supervisión' : 'Mi Área')"
          class="q-px-md text-weight-bold"
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

        <!-- Botón Firmar para Contratista (Exclusivo para el Contratista en su recuadro final) -->
        <q-btn
          v-if="esContratista && datosSolicitud.estado !== 'Rechazado' && !firmaGuardada"
          unelevated
          dense
          color="positive"
          icon="draw"
          label="Firmar como Contratista"
          class="q-px-md text-weight-bold shadow-1"
          @click="abrirModalFirma"
        >
          <q-tooltip>Estampar la firma del contratista en el certificado</q-tooltip>
        </q-btn>
        <q-btn
          v-if="esContratista && datosSolicitud.estado !== 'Rechazado' && firmaGuardada"
          flat
          dense
          color="grey-7"
          icon="close"
          class="q-px-xs"
          @click="limpiarFirma"
        >
          <q-tooltip>Borrar firma del contratista</q-tooltip>
        </q-btn>

        <!-- Botón Plantilla y Firmantes: Alta visibilidad, exclusivo para Supervisor y Admin -->
        <q-btn
          v-if="!esContratista"
          unelevated
          dense
          color="teal-8"
          icon="tune"
          label="Plantilla y Firmantes"
          class="q-px-md text-weight-bold shadow-1"
          @click="abrirModalPlantillaFirmas"
        >
          <q-tooltip
            >Configurar qué dependencias aplican para este contrato y asignar sus firmantes autorizados</q-tooltip
          >
        </q-btn>

        <!-- Botón Editar Formato -->
        <q-btn
          outline
          dense
          color="primary"
          icon="edit_note"
          label="Editar Formato"
          class="q-px-md text-weight-bold"
          @click="abrirModalEditarDatos"
        >
          <q-tooltip
            >Modificar o completar datos del contratista, contrato, regional y causal</q-tooltip
          >
        </q-btn>

        <!-- Botón Imprimir -->
        <q-btn
          unelevated
          dense
          :color="datosSolicitud.estado === 'Rechazado' ? 'grey-8' : 'positive'"
          icon="print"
          :label="datosSolicitud.estado === 'Rechazado' ? 'Imprimir Borrador' : 'Imprimir'"
          class="q-px-lg text-weight-bold shadow-1"
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
          <div
            v-for="fila in filasDependencias"
            :key="fila.id"
            class="tr-row"
            :class="{ 'tr-no-aplica': fila.aplica === false }"
          >
            <div class="td-dep" v-html="fila.dependencia"></div>
            <div class="td-marca" :class="{ 'td-marca-na': fila.aplica === false }">
              {{ fila.aplica === false ? 'N/A' : (fila.marca || 'X') }}
            </div>
            <div class="td-nombres" :class="{ 'td-nombres-na': fila.aplica === false }">
              <span v-if="fila.aplica === false" class="texto-na-detalle">
                No Aplica — Trámite no requerido para este contrato
              </span>
              <span v-else v-html="fila.nombres"></span>
            </div>
            <div
              class="td-firma"
              :class="{
                'cursor-pointer': fila.aplica !== false && puedeFirmarFila(fila),
                'cursor-default': fila.aplica === false || !puedeFirmarFila(fila),
              }"
              @click="fila.aplica !== false && puedeFirmarFila(fila) ? abrirModalFirmaFila(fila) : null"
              :title="
                fila.aplica === false
                  ? 'Esta dependencia no aplica para este contrato (N/A)'
                  : firmasTabla[fila.id]
                    ? 'Firma registrada de ' + fila.nombres
                    : puedeFirmarFila(fila)
                      ? 'Clic para estampar tu firma como responsable de esta dependencia'
                      : 'Firma reservada exclusivamente para ' + fila.nombres
              "
            >
              <!-- Si la dependencia no aplica en este contrato -->
              <div v-if="fila.aplica === false" class="badge-na-container">
                <span class="badge-na no-print">No Aplica</span>
                <span class="badge-na-print only-print">— N/A —</span>
              </div>
              <img
                v-else-if="firmasTabla[fila.id]"
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
            <div v-else class="lineas-puntos-elementos">
              <div class="linea-punto"></div>
              <div class="linea-punto"></div>
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

          <!-- Supervisor Asignado al Contrato (Fila 14 y Fila 3) -->
          <div class="q-mb-md">
            <q-select
              v-model="formularioEdicion.responsable"
              :options="opcionesFirmantesSupervisor"
              label="Supervisor Asignado al Contrato *"
              outlined
              dense
              use-input
              :disable="esContratista"
              :readonly="esContratista"
              new-value-mode="add-unique"
              :hint="
                esContratista
                  ? 'Supervisor asignado a su contrato (solo puede ser modificado por el Supervisor o Administrador)'
                  : 'Supervisor responsable de este contrato que firmará la fila 14 y la fila 3 del formato oficial'
              "
            >
              <template #prepend>
                <q-icon name="engineering" color="primary" />
              </template>
            </q-select>
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

    <!-- Diálogo para Seleccionar Plantilla y Asignar Firmantes por Dependencia (GCCON-F-088) -->
    <q-dialog v-model="dialogoPlantillaFirmas" persistent>
      <q-card style="min-width: 820px; max-width: 95vw; border-radius: 12px">
        <q-card-section class="bg-teal-8 text-white row items-center justify-between q-py-md">
          <div>
            <div class="text-h6 text-weight-bold">
              <q-icon name="tune" class="q-mr-sm" />
              Plantilla de Paz y Salvo y Asignación de Firmantes (GCCON-F-088)
            </div>
            <div class="text-caption text-teal-1">
              Configure qué dependencias aplican para este contrato y asigne quiénes firmarán en cada área.
            </div>
          </div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-lg scroll" style="max-height: 75vh">
          <!-- 1. Selección de Plantilla Rápida -->
          <div class="text-subtitle2 text-weight-bold text-dark q-mb-xs">
            1. Seleccionar Plantilla según el Tipo de Contrato:
          </div>
          <div class="text-caption text-grey-7 q-mb-md">
            Al seleccionar una plantilla se configuran automáticamente las dependencias que aplican y las que no aplican (N/A).
          </div>

          <div class="row q-col-gutter-sm q-mb-lg">
            <div
              v-for="(plan, k) in plantillasPredefinidas"
              :key="k"
              class="col-12 col-md-6"
            >
              <q-card
                flat
                bordered
                class="cursor-pointer p-card full-height"
                :class="{
                  'bg-green-1 border-primary-active': plantillaSeleccionada === k,
                  'bg-grey-1': plantillaSeleccionada !== k,
                }"
                @click="seleccionarPlantilla(k)"
              >
                <q-card-section class="q-pa-sm row items-start no-wrap">
                  <q-radio
                    v-model="plantillaSeleccionada"
                    :val="k"
                    color="teal-8"
                    dense
                    class="q-mr-sm"
                    @update:model-value="seleccionarPlantilla(k)"
                  />
                  <div>
                    <div class="text-weight-bold text-caption text-dark">
                      {{ plan.nombre }}
                    </div>
                    <div class="text-caption text-grey-7" style="font-size: 11px; line-height: 1.25">
                      {{ plan.descripcion }}
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <q-separator class="q-my-md" />

          <!-- 2. Tabla Interactiva de Dependencias y Firmantes -->
          <div class="row items-center justify-between q-mb-sm">
            <div>
              <div class="text-subtitle2 text-weight-bold text-dark">
                2. Dependencias Oficiales y Firmantes Asignados (14 Áreas GCCON-F-088):
              </div>
              <div class="text-caption text-grey-7">
                Use los interruptores para activar/desactivar dependencias y defina los firmantes autorizados.
              </div>
            </div>
            <q-badge color="grey-8" class="q-pa-xs">
              {{ contarDependenciasActivas }} de 14 dependencias aplican
            </q-badge>
          </div>

          <div class="tabla-config-firmas">
            <div
              v-for="fila in configFilasTemporal"
              :key="fila.id"
              class="fila-config-item row items-center q-py-xs q-px-sm q-mb-xs"
              :class="{
                'bg-green-1': fila.aplica,
                'bg-grey-2 opacity-75': !fila.aplica,
              }"
            >
              <!-- Switch Aplica / N/A -->
              <div class="col-auto q-mr-sm">
                <q-toggle
                  v-model="fila.aplica"
                  color="positive"
                  dense
                  @update:model-value="alCambiarSwitchFila"
                >
                  <q-tooltip>{{ fila.aplica ? 'Aplica en este contrato (Marcar con X)' : 'No Aplica en este contrato (N/A)' }}</q-tooltip>
                </q-toggle>
              </div>

              <!-- Nombre Dependencia -->
              <div class="col-12 col-sm-4 q-pr-sm">
                <div class="row items-center no-wrap">
                  <q-badge
                    :color="fila.aplica ? 'teal-8' : 'grey-6'"
                    :label="fila.aplica ? fila.id + ' [X]' : fila.id + ' [N/A]'"
                    class="q-mr-xs text-weight-bold"
                  />
                  <span
                    class="text-caption text-weight-medium"
                    :class="{ 'text-grey-6 text-strike': !fila.aplica }"
                    v-html="fila.dependenciaSimple || fila.dependencia.replace(/<[^>]*>/g, ' ')"
                  ></span>
                </div>
              </div>

              <!-- Firmante Asignado -->
              <div class="col-12 col-sm-7">
                <template v-if="!fila.aplica">
                  <div class="text-caption text-italic text-grey-6 q-pa-xs">
                    — No Aplica (Trámite no requerido para este tipo de contrato) —
                  </div>
                </template>
                <template v-else>
                  <!-- Fila 14 (SUPERVISOR DE CONTRATO) -->
                  <q-select
                    v-if="fila.id === 14"
                    v-model="fila.nombres"
                    :options="opcionesFirmantesSupervisor"
                    dense
                    outlined
                    use-input
                    new-value-mode="add-unique"
                    label="Supervisor del Contrato Asignado *"
                    bg-color="white"
                    hint="Seleccione de la lista o ingrese el nombre del supervisor asignado"
                  >
                    <template #prepend>
                      <q-icon name="engineering" color="primary" />
                    </template>
                  </q-select>

                  <!-- Fila 3 (ENTREGA CARNÉ) -->
                  <q-select
                    v-else-if="fila.id === 3"
                    v-model="fila.nombres"
                    :options="opcionesFirmantesCarne"
                    dense
                    outlined
                    use-input
                    new-value-mode="add-unique"
                    label="Responsable Entrega Carné (Supervisor / Secretaría)"
                    bg-color="white"
                  >
                    <template #prepend>
                      <q-icon name="badge" color="primary" />
                    </template>
                  </q-select>

                  <!-- Fila 9 (BIBLIOTECA) -->
                  <q-select
                    v-else-if="fila.id === 9"
                    v-model="fila.nombres"
                    :options="opcionesFirmantesBiblioteca"
                    dense
                    outlined
                    use-input
                    new-value-mode="add-unique"
                    label="Firmante(s) Autorizado(s) Biblioteca *"
                    bg-color="white"
                    hint="Puede seleccionar cualquiera de los autorizados o ambas personas"
                  >
                    <template #prepend>
                      <q-icon name="local_library" color="teal-8" />
                    </template>
                  </q-select>

                  <!-- Fila 12 (NOVEDADES) -->
                  <q-select
                    v-else-if="fila.id === 12"
                    v-model="fila.nombres"
                    :options="opcionesFirmantesNovedades"
                    dense
                    outlined
                    use-input
                    new-value-mode="add-unique"
                    label="Firmante(s) Novedades Administrativas"
                    bg-color="white"
                  >
                    <template #prepend>
                      <q-icon name="people" color="primary" />
                    </template>
                  </q-select>

                  <!-- Otras dependencias -->
                  <q-input
                    v-else
                    v-model="fila.nombres"
                    dense
                    outlined
                    bg-color="white"
                    label="Nombre y Apellidos del Responsable"
                  >
                    <template #prepend>
                      <q-icon name="person" color="primary" />
                    </template>
                  </q-input>
                </template>
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
            label="Guardar y Aplicar Plantilla"
            color="teal-8"
            @click="guardarPlantillaFirmas"
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

const plantillasPredefinidas = {
  COMPLETA: {
    id: 'COMPLETA',
    nombre: 'Plantilla Completa Institucional (14 Dependencias)',
    descripcion: 'Aplica para contratos que requieren validación de todas las 14 dependencias del Centro.',
    filasAplica: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
  },
  SERVICIOS_PROFESIONALES: {
    id: 'SERVICIOS_PROFESIONALES',
    nombre: 'Servicios Profesionales / Apoyo a la Gestión (7 Dependencias)',
    descripcion: 'Aplica para contratos administrativos y de apoyo (TIC, Carné, Almacén, Contabilidad, Tesorería, Supervisor). Las áreas académicas quedan en N/A.',
    filasAplica: [1, 2, 3, 4, 6, 7, 14],
  },
  INSTRUCTORES: {
    id: 'INSTRUCTORES',
    nombre: 'Instructores y Formación Profesional (7 Dependencias)',
    descripcion: 'Aplica para instructores y formación (TIC, Carné, Almacén, Académica, Biblioteca, Etapa Productiva, Supervisor). Trámites administrativos en N/A.',
    filasAplica: [1, 3, 4, 8, 9, 13, 14],
  },
  PERSONALIZADA: {
    id: 'PERSONALIZADA',
    nombre: 'Plantilla Personalizada (Configuración a Medida)',
    descripcion: 'El supervisor activa o desactiva libremente las dependencias que aplican y asigna los firmantes para este contrato.',
    filasAplica: null,
  },
}

const plantillaSeleccionada = ref('COMPLETA')
const dialogoPlantillaFirmas = ref(false)
const configFilasTemporal = ref([])

const filasDependencias = ref([
  {
    id: 1,
    dependencia: 'GESTIÓN DE TIC',
    dependenciaSimple: 'Gestión de TIC',
    aplica: true,
    marca: 'X',
    nombres: 'Franklin Rolando Chacon Lopez',
  },
  {
    id: 2,
    dependencia: 'ADMINISTRACIÓN DE DOCUMENTOS',
    dependenciaSimple: 'Administración de Documentos',
    aplica: true,
    marca: 'X',
    nombres: 'Hilda Lucia Ramirez Alvarado',
  },
  {
    id: 3,
    dependencia:
      'ENTREGA CARNÉ (Al Supervisor del Contrato en las Regionales y Centros de Formación)<br>SECRETARÍA GENERAL',
    dependenciaSimple: 'Entrega Carné (Al Supervisor del Contrato) / Secretaría General',
    aplica: true,
    marca: 'X',
    nombres: 'Ing. Carlos Supervisor',
  },
  {
    id: 4,
    dependencia: 'ALMACÉN E INVENTARIOS',
    dependenciaSimple: 'Almacén e Inventarios',
    aplica: true,
    marca: 'X',
    nombres:
      'Generar reporte de https://miinventario.sena.edu.co/Inicio.aspx y anexar al formato, garantizando que no tiene elementos a su cargo.',
  },
  {
    id: 5,
    dependencia: 'SERVICIOS GENERALES, ADQUISICIONES<br>(Administración de edificio; Contratación)',
    dependenciaSimple: 'Servicios Generales, Adquisiciones',
    aplica: true,
    marca: 'X',
    nombres: 'Juan David Silva Guierrez',
  },
  {
    id: 6,
    dependencia: 'CONTABILIDAD',
    dependenciaSimple: 'Contabilidad',
    aplica: true,
    marca: 'X',
    nombres: 'Zaida Leny Melgarejo Ballesteros',
  },
  {
    id: 7,
    dependencia: 'TESORERIA',
    dependenciaSimple: 'Tesorería',
    aplica: true,
    marca: 'X',
    nombres: 'Nelcy Mabel Mayorga Pinto',
  },
  {
    id: 8,
    dependencia: 'COORDINACIÓN DE:<br>ÁREA/GRUPO/ ACADEMICA',
    dependenciaSimple: 'Coordinación Académica',
    aplica: true,
    marca: 'X',
    nombres: 'Johon Fredy Sanabria Muñoz',
  },
  {
    id: 9,
    dependencia: 'BIBLIOTECA',
    dependenciaSimple: 'Biblioteca',
    aplica: true,
    marca: 'X',
    nombres: 'Andrea Juliana Celis Camacho / Yudith Milagros Martinez Bautista',
  },
  {
    id: 10,
    dependencia: 'OTRO (LIDER SIGA)',
    dependenciaSimple: 'Líder SIGA',
    aplica: true,
    marca: 'X',
    nombres: 'Zaida Jeleidy Garcia Jaimes',
  },
  {
    id: 11,
    dependencia: 'OTRO (AMINISTRACION EDUCATIVA)',
    dependenciaSimple: 'Administración Educativa',
    aplica: true,
    marca: 'X',
    nombres: 'Erika Johana Gómez Verdugo',
  },
  {
    id: 12,
    dependencia: 'APOYO AL SEGUIMIENTO DE LOS PROCESOS ADMINISTRATIVOS Y NOVEDADES',
    dependenciaSimple: 'Apoyo a Procesos Administrativos y Novedades',
    aplica: true,
    marca: 'X',
    nombres: 'Nelson Fabian Duarte Peñaloza / Eileen Erlensi Hurtado Ariza',
  },
  {
    id: 13,
    dependencia: 'APOYO ETAPA PRODUCTIVA',
    dependenciaSimple: 'Apoyo Etapa Productiva',
    aplica: true,
    marca: 'X',
    nombres: 'Karen Andrea Garcia Carreño',
  },
  {
    id: 14,
    dependencia: 'SUPERVISOR DE CONTRATO',
    dependenciaSimple: 'Supervisor de Contrato',
    aplica: true,
    marca: 'X',
    nombres: 'Ing. Carlos Supervisor',
  },
])

const contarDependenciasActivas = computed(() => {
  return configFilasTemporal.value.filter((f) => f.aplica).length
})

const opcionesFirmantesSupervisor = computed(() => {
  const sups = [
    datosSolicitud.value.responsable,
    'Ing. Carlos Supervisor',
    'Johon Fredy Sanabria Muñoz',
    'Dra. Ana María Gómez',
    'Ing. Fernando Ramírez',
  ].filter(Boolean)
  return Array.from(new Set(sups))
})

const opcionesFirmantesCarne = computed(() => {
  const carnes = [
    datosSolicitud.value.responsable || 'Ing. Carlos Supervisor',
    'Secretaría General - Johon Fredy Sanabria Muñoz',
    'Johon Fredy Sanabria Muñoz',
    'Ing. Carlos Supervisor',
  ].filter(Boolean)
  return Array.from(new Set(carnes))
})

const opcionesFirmantesBiblioteca = [
  'Andrea Juliana Celis Camacho / Yudith Milagros Martinez Bautista',
  'Andrea Juliana Celis Camacho',
  'Yudith Milagros Martinez Bautista',
  'Lic. Jorge Biblioteca',
]

const opcionesFirmantesNovedades = [
  'Nelson Fabian Duarte Peñaloza / Eileen Erlensi Hurtado Ariza',
  'Nelson Fabian Duarte Peñaloza',
  'Eileen Erlensi Hurtado Ariza',
]

function sincronizarSupervisorConFilas(forzar = false) {
  const supReal =
    datosSolicitud.value.responsable ||
    (auth.rolUsuario === 'SUPERVISOR' ? auth.usuario?.nombre : null) ||
    'Ing. Carlos Supervisor'

  const f14 = filasDependencias.value.find((f) => f.id === 14)
  if (f14) {
    if (forzar || !f14.nombres || f14.nombres === 'Johon Fredy Sanabria Muñoz' || f14.nombres === 'Ing. Carlos Supervisor') {
      f14.nombres = supReal
    }
  }

  const f3 = filasDependencias.value.find((f) => f.id === 3)
  if (f3) {
    if (forzar || !f3.nombres || f3.nombres === 'Johon Fredy Sanabria Muñoz' || f3.nombres === 'Ing. Carlos Supervisor') {
      f3.nombres = supReal
    }
  }
}

function abrirModalPlantillaFirmas() {
  if (esContratista.value) {
    $q.notify({
      type: 'warning',
      message: 'La configuración de plantilla y firmantes es exclusiva del Supervisor o Administrador.',
      icon: 'lock',
    })
    return
  }

  const codigo = route.query.codigo || route.params.id || datosSolicitud.value.contratista
  const tipoGuardado =
    localStorage.getItem(`plantilla_tipo_${codigo}`) ||
    datosSolicitud.value.plantillaTipo ||
    'COMPLETA'

  plantillaSeleccionada.value = tipoGuardado

  configFilasTemporal.value = filasDependencias.value.map((f) => ({
    ...f,
    aplica: f.aplica !== false,
    nombres: f.nombres || '',
  }))

  dialogoPlantillaFirmas.value = true
}

function seleccionarPlantilla(tipo) {
  plantillaSeleccionada.value = tipo
  if (tipo === 'PERSONALIZADA') return

  const preset = plantillasPredefinidas[tipo]
  if (!preset || !Array.isArray(preset.filasAplica)) return

  configFilasTemporal.value.forEach((fila) => {
    fila.aplica = preset.filasAplica.includes(fila.id)
    fila.marca = fila.aplica ? 'X' : 'N/A'
  })
}

function alCambiarSwitchFila() {
  const activas = configFilasTemporal.value
    .filter((f) => f.aplica)
    .map((f) => f.id)
    .sort((a, b) => a - b)

  const compActivas = [...plantillasPredefinidas.COMPLETA.filasAplica].sort((a, b) => a - b)
  const servActivas = [...plantillasPredefinidas.SERVICIOS_PROFESIONALES.filasAplica].sort(
    (a, b) => a - b,
  )
  const instActivas = [...plantillasPredefinidas.INSTRUCTORES.filasAplica].sort((a, b) => a - b)

  if (JSON.stringify(activas) === JSON.stringify(compActivas)) {
    plantillaSeleccionada.value = 'COMPLETA'
  } else if (JSON.stringify(activas) === JSON.stringify(servActivas)) {
    plantillaSeleccionada.value = 'SERVICIOS_PROFESIONALES'
  } else if (JSON.stringify(activas) === JSON.stringify(instActivas)) {
    plantillaSeleccionada.value = 'INSTRUCTORES'
  } else {
    plantillaSeleccionada.value = 'PERSONALIZADA'
  }
}

function guardarPlantillaFirmas() {
  filasDependencias.value = configFilasTemporal.value.map((f) => ({
    ...f,
    marca: f.aplica ? 'X' : 'N/A',
  }))

  const codigo = route.query.codigo || route.params.id || datosSolicitud.value.contratista

  if (codigo) {
    localStorage.setItem(`plantilla_firmas_${codigo}`, JSON.stringify(filasDependencias.value))
    localStorage.setItem(`plantilla_tipo_${codigo}`, plantillaSeleccionada.value)
    localStorage.setItem(
      `plantilla_firmas_${String(codigo).toLowerCase().trim()}`,
      JSON.stringify(filasDependencias.value),
    )
  }
  if (datosSolicitud.value.contratista) {
    localStorage.setItem(
      `plantilla_firmas_${datosSolicitud.value.contratista.toLowerCase().trim()}`,
      JSON.stringify(filasDependencias.value),
    )
    localStorage.setItem(
      `plantilla_tipo_${datosSolicitud.value.contratista.toLowerCase().trim()}`,
      plantillaSeleccionada.value,
    )
  }
  if (datosSolicitud.value.numeroContrato) {
    localStorage.setItem(
      `plantilla_firmas_${datosSolicitud.value.numeroContrato.toLowerCase().trim()}`,
      JSON.stringify(filasDependencias.value),
    )
  }

  // Sincronizar en store de solicitudes
  if (Array.isArray(store.solicitudes)) {
    const item = store.solicitudes.find(
      (s) =>
        s._id === codigo ||
        s.id === codigo ||
        s.numeroSolicitud === codigo ||
        s.numeroContrato === codigo ||
        (s.contratista &&
          s.contratista.toLowerCase().trim() ===
            datosSolicitud.value.contratista.toLowerCase().trim()),
    )
    if (item) {
      item.plantillaTipo = plantillaSeleccionada.value
      item.filasDependencias = filasDependencias.value
      if (typeof store.actualizarSolicitud === 'function') {
        store
          .actualizarSolicitud(item._id || item.numeroContrato || codigo, {
            plantillaTipo: plantillaSeleccionada.value,
            filasDependencias: filasDependencias.value,
          })
          .catch((e) => console.warn('Error al sincronizar plantilla con backend:', e))
      }
    }
  }

  dialogoPlantillaFirmas.value = false
  $q.notify({
    type: 'positive',
    message: `Plantilla de paz y salvo (${plantillasPredefinidas[plantillaSeleccionada.value]?.nombre || 'Personalizada'}) configurada exitosamente.`,
    icon: 'assignment_turned_in',
  })
}

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
  if (fila.aplica === false) return false

  const u = auth.usuario
  if (!u) return false

  const rol = (auth.rolUsuario || '').toUpperCase()

  // CONTRATISTA NUNCA PUEDE FIRMAR FILAS DE DEPENDENCIAS (1 al 14) NI SUPERVISIÓN
  // Su firma es exclusivamente la de abajo ("Firma del Contratista")
  if (rol === 'CONTRATISTA' || esContratista.value) {
    return false
  }

  // Administrador tiene permisos para supervisión y firmas
  if (rol === 'ADMIN') return true

  const nombreUsuario = normalizarTexto(u.nombre || u.nombre_completo)
  const correoUsuario = normalizarTexto(u.correo || u.correo_institucional)
  const depUsuario = normalizarTexto(u.dependencia)
  const cargoUsuario = normalizarTexto(u.cargo)
  const nombresFila = normalizarTexto(fila.nombres)
  const responsableContratoNorm = normalizarTexto(datosSolicitud.value.responsable)

  // 1. Fila 14 (SUPERVISOR DE CONTRATO)
  if (fila.id === 14) {
    if (rol === 'SUPERVISOR') return true
    if (
      responsableContratoNorm &&
      nombreUsuario &&
      (nombreUsuario === responsableContratoNorm ||
        (nombreUsuario.length >= 6 && responsableContratoNorm.includes(nombreUsuario)) ||
        (responsableContratoNorm.length >= 6 && nombreUsuario.includes(responsableContratoNorm)))
    ) {
      return true
    }
    if (
      nombresFila &&
      nombreUsuario &&
      (nombresFila === nombreUsuario ||
        (nombreUsuario.length >= 6 && nombresFila.includes(nombreUsuario)) ||
        (nombresFila.length >= 6 && nombreUsuario.includes(nombresFila)))
    ) {
      return true
    }
    if (correoUsuario.includes('supervisor')) {
      return true
    }
  }

  // 2. Fila 3 (ENTREGA CARNÉ al supervisor)
  if (fila.id === 3) {
    if (rol === 'SUPERVISOR') return true
    if (
      responsableContratoNorm &&
      nombreUsuario &&
      (nombreUsuario === responsableContratoNorm ||
        (nombreUsuario.length >= 6 && responsableContratoNorm.includes(nombreUsuario)) ||
        (responsableContratoNorm.length >= 6 && nombreUsuario.includes(responsableContratoNorm)))
    ) {
      return true
    }
    if (
      nombresFila &&
      nombreUsuario &&
      (nombresFila === nombreUsuario ||
        (nombreUsuario.length >= 6 && nombresFila.includes(nombreUsuario)) ||
        (nombresFila.length >= 6 && nombreUsuario.includes(nombresFila)))
    ) {
      return true
    }
    if (
      correoUsuario.includes('secretaria') ||
      correoUsuario.includes('carne')
    ) {
      return true
    }
  }

  // 3. Fila 9 (BIBLIOTECA - Múltiples firmantes autorizados)
  if (fila.id === 9) {
    if (
      nombreUsuario.includes('andrea') ||
      nombreUsuario.includes('juliana') ||
      nombreUsuario.includes('celis') ||
      nombreUsuario.includes('yudith') ||
      nombreUsuario.includes('milagros') ||
      nombreUsuario.includes('martinez') ||
      nombreUsuario.includes('jorge') ||
      nombreUsuario.includes('biblioteca') ||
      depUsuario.includes('biblio') ||
      cargoUsuario.includes('biblio') ||
      correoUsuario.includes('biblio') ||
      correoUsuario.includes('celis') ||
      correoUsuario.includes('martinez')
    ) {
      return true
    }
  }

  // 4. Solo RESPONSABLE_AREA puede firmar dependencias (filas 1 a 13)
  if (!esResponsableArea.value) {
    return false
  }

  // Coincidencia directa por nombre asignado a la fila
  if (nombreUsuario && nombresFila) {
    if (nombresFila.includes(nombreUsuario) || nombreUsuario.includes(nombresFila)) {
      return true
    }
  }

  // Coincidencias por correo institucional
  if (correoUsuario) {
    if (fila.id === 1 && (correoUsuario.includes('tic') || correoUsuario.includes('chacon')))
      return true
    if (fila.id === 2 && (correoUsuario.includes('document') || correoUsuario.includes('ramirez')))
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
  }

  // Coincidencias por nombre
  if (nombreUsuario) {
    if (fila.id === 1 && (nombreUsuario.includes('franklin') || nombreUsuario.includes('chacon')))
      return true
    if (
      fila.id === 2 &&
      (nombreUsuario.includes('hilda') ||
        (nombreUsuario.includes('lucia') && nombreUsuario.includes('ramirez')))
    )
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
  }

  // Coincidencia por dependencia configurada en el perfil
  if (depUsuario) {
    if (
      fila.id === 1 &&
      (depUsuario.includes('tic') ||
        depUsuario.includes('tecnol'))
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

function limpiarFirma() {
  firmaGuardada.value = null
  const codigo = route.query.codigo || route.params.id
  if (codigo) {
    localStorage.removeItem(`firma_${codigo}`)
  }
  localStorage.removeItem('ultima_firma')
  $q.notify({
    type: 'info',
    message: 'Firma de contratista removida.',
  })
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
  responsable: 'Ing. Carlos Supervisor',
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
    responsable: datosSolicitud.value.responsable || 'Ing. Carlos Supervisor',
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
      if (!item.dependencia) {
        item.dependencia = datosSolicitud.value.direccion
      }
      item.numeroContrato = datosSolicitud.value.numeroContrato
      item.fechaContrato = datosSolicitud.value.fechaContrato
      item.causalTerminacion = datosSolicitud.value.causalTerminacion
      item.clasificacion = datosSolicitud.value.clasificacion

      if (typeof store.actualizarSolicitud === 'function') {
        store.actualizarSolicitud(item._id || item.numeroContrato || codigo, {
          contratista: item.contratista,
          identificacion: item.identificacion,
          documento_contratista: item.identificacion,
          ciudad: item.ciudad,
          regional: item.regional,
          direccion: item.direccion,
          numeroContrato: item.numeroContrato,
          numero_contrato: item.numeroContrato,
          fechaContrato: item.fechaContrato,
          causalTerminacion: item.causalTerminacion,
          clasificacion: item.clasificacion,
        }).catch((e) => console.warn('Error al sincronizar datos desde certificado con backend:', e))
      }
    }
  }

  sincronizarSupervisorConFilas()
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
  if (typeof store.cargarSolicitudes === 'function') {
    try {
      await store.cargarSolicitudes()
    } catch (e) {
      console.warn('Error al cargar solicitudes en certificado:', e)
    }
  }
  if (contratistasStore.contratistas?.length === 0 && contratistasStore.cargarContratistas) {
    try {
      await contratistasStore.cargarContratistas()
    } catch (e) {
      console.warn('Error al cargar contratistas en certificado:', e)
    }
  }

  const codigo =
    route.query.codigo ||
    route.params.id ||
    (auth.rolUsuario === 'CONTRATISTA' ? (auth.usuario?.numeroContrato || auth.usuario?.nombre) : '') ||
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
    }
    if (!encontrada && Array.isArray(store.solicitudes)) {
      const codMin = String(codigo).trim().toLowerCase()
      encontrada = store.solicitudes.find(
        (s) =>
          String(s.numeroSolicitud || '').trim().toLowerCase() === codMin ||
          String(s.solicitud || '').trim().toLowerCase() === codMin ||
          String(s.codigo || '').trim().toLowerCase() === codMin ||
          String(s.numeroContrato || '').trim().toLowerCase() === codMin ||
          String(s.contrato || '').trim().toLowerCase() === codMin ||
          String(s.id || '').trim().toLowerCase() === codMin ||
          String(s._id || '').trim().toLowerCase() === codMin ||
          String(s.contratista || '').trim().toLowerCase() === codMin ||
          String(s.nombreContratista || '').trim().toLowerCase() === codMin ||
          String(s.identificacion || '').trim() === String(codigo).trim() ||
          String(s.documentoContratista || '').trim() === String(codigo).trim(),
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
        (auth.rolUsuario === 'CONTRATISTA' ? auth.usuario?.nombre : '') ||
        'Contratista'

      // Resolver identificación
      let docResuelto = ''
      if (encontrada.identificacion && encontrada.identificacion !== '—') {
        docResuelto = String(encontrada.identificacion).trim()
      } else if (encontrada.documentoContratista && encontrada.documentoContratista !== '—') {
        docResuelto = String(encontrada.documentoContratista).trim()
      } else if (encontrada.documento && encontrada.documento !== '—') {
        docResuelto = String(encontrada.documento).trim()
      }

      if (!docResuelto) {
        const idenStorage =
          localStorage.getItem(`certificado_identificacion_${codigo}`) ||
          localStorage.getItem(`certificado_identificacion_${String(codigo).toLowerCase().trim()}`) ||
          (numContrato ? localStorage.getItem(`certificado_identificacion_${numContrato}`) : null) ||
          (numContrato ? localStorage.getItem(`certificado_identificacion_${String(numContrato).toLowerCase().trim()}`) : null) ||
          (nomContratista
            ? localStorage.getItem(
                `certificado_identificacion_${nomContratista.toLowerCase().trim()}`,
              )
            : null)
        if (idenStorage && idenStorage !== '—') {
          docResuelto = idenStorage.trim()
        }
      }

      if (!docResuelto && datosSolicitud.value.identificacion && datosSolicitud.value.identificacion !== '—') {
        docResuelto = String(datosSolicitud.value.identificacion).trim()
      }

      if (!docResuelto && nomContratista) {
        const conMatch = contratistasStore.contratistas?.find(
          (c) => (c.nombre || '').trim().toLowerCase() === nomContratista.trim().toLowerCase(),
        )
        if (conMatch?.documento && conMatch.documento !== '—') {
          docResuelto = String(conMatch.documento).trim()
        }
      }

      if (!docResuelto && auth.usuario) {
        if (
          auth.rolUsuario === 'CONTRATISTA' ||
          (auth.usuario?.nombre || '').trim().toLowerCase() === nomContratista.trim().toLowerCase()
        ) {
          const docAuth = auth.usuario.documento || auth.usuario.identificacion
          if (docAuth && docAuth !== '—') {
            docResuelto = String(docAuth).trim()
          }
        }
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
            item.numero === codigo ||
            (item.numero_contrato && String(item.numero_contrato).toLowerCase().trim() === String(codigo).toLowerCase().trim()) ||
            (item.nombre_contratista && String(item.nombre_contratista).toLowerCase().trim() === String(codigo).toLowerCase().trim()),
        )
        if (c) {
          const nomApi =
            c.nombre_contratista ||
            c.contratista ||
            datosSolicitud.value.contratista ||
            (auth.rolUsuario === 'CONTRATISTA' ? auth.usuario?.nombre : '') ||
            'Contratista'

          let docApi =
            c.documento_contratista ||
            c.identificacion ||
            c.documento ||
            c.usuario?.documento ||
            localStorage.getItem(`certificado_identificacion_${codigo}`) ||
            localStorage.getItem(`certificado_identificacion_${String(codigo).toLowerCase().trim()}`) ||
            (c.numero_contrato ? localStorage.getItem(`certificado_identificacion_${c.numero_contrato}`) : null) ||
            (nomApi ? localStorage.getItem(`certificado_identificacion_${nomApi.toLowerCase().trim()}`) : null) ||
            datosSolicitud.value.identificacion ||
            ''

          if (!docApi || docApi === '—') {
            const matchCt = contratistasStore.contratistas?.find(
              (ct) => (ct.nombre || '').trim().toLowerCase() === nomApi.trim().toLowerCase(),
            )
            if (matchCt?.documento && matchCt.documento !== '—') {
              docApi = matchCt.documento
            } else if (
              auth.usuario?.documento &&
              (auth.rolUsuario === 'CONTRATISTA' ||
                (auth.usuario?.nombre || '').trim().toLowerCase() === nomApi.trim().toLowerCase())
            ) {
              docApi = auth.usuario.documento
            } else if (auth.usuario?.identificacion && auth.rolUsuario === 'CONTRATISTA') {
              docApi = auth.usuario.identificacion
            }
          }

          datosSolicitud.value = {
            ...datosSolicitud.value,
            contratista: nomApi,
            identificacion: docApi || '',
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

      // Si aún faltan datos de contratista, buscar por usuario
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
          const docLimpio = u.documento || u.telefono || ''
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

    // Verificación final de identificación si quedó vacía
    if (!datosSolicitud.value.identificacion || datosSolicitud.value.identificacion === '—') {
      const nomFinal = (datosSolicitud.value.contratista || (auth.rolUsuario === 'CONTRATISTA' ? auth.usuario?.nombre : '') || '')
        .trim()
        .toLowerCase()
      const conMatch = contratistasStore.contratistas?.find(
        (c) => (c.nombre || '').trim().toLowerCase() === nomFinal,
      )
      if (conMatch?.documento && conMatch.documento !== '—') {
        datosSolicitud.value.identificacion = conMatch.documento
      } else if (
        auth.usuario?.documento &&
        (auth.rolUsuario === 'CONTRATISTA' ||
          (auth.usuario?.nombre || '').trim().toLowerCase() === nomFinal)
      ) {
        datosSolicitud.value.identificacion = auth.usuario.documento
      } else if (auth.usuario?.identificacion && auth.rolUsuario === 'CONTRATISTA') {
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
      datosSolicitud.value.bienesFaltantes = []
    }

    // Restaurar plantilla de dependencias y firmantes para este contrato si fue guardada
    const clavePlantilla = `plantilla_firmas_${String(codigo).toLowerCase().trim()}`
    const plantillaGuardada =
      localStorage.getItem(`plantilla_firmas_${codigo}`) ||
      localStorage.getItem(clavePlantilla) ||
      (datosSolicitud.value.numeroContrato
        ? localStorage.getItem(
            `plantilla_firmas_${datosSolicitud.value.numeroContrato.toLowerCase().trim()}`,
          )
        : null)

    const tipoPlantillaGuardada =
      localStorage.getItem(`plantilla_tipo_${codigo}`) ||
      localStorage.getItem(`plantilla_tipo_${String(codigo).toLowerCase().trim()}`) ||
      (datosSolicitud.value.numeroContrato
        ? localStorage.getItem(
            `plantilla_tipo_${datosSolicitud.value.numeroContrato.toLowerCase().trim()}`,
          )
        : null) ||
      datosSolicitud.value.plantillaTipo

    if (plantillaGuardada) {
      try {
        const parsedFilas = JSON.parse(plantillaGuardada)
        if (Array.isArray(parsedFilas) && parsedFilas.length > 0) {
          filasDependencias.value = parsedFilas
        }
      } catch (e) {
        console.warn('Error al restaurar plantilla de firmas:', e)
      }
    } else if (tipoPlantillaGuardada && plantillasPredefinidas[tipoPlantillaGuardada]) {
      plantillaSeleccionada.value = tipoPlantillaGuardada
      const preset = plantillasPredefinidas[tipoPlantillaGuardada]
      if (preset && Array.isArray(preset.filasAplica)) {
        filasDependencias.value.forEach((fila) => {
          fila.aplica = preset.filasAplica.includes(fila.id)
          fila.marca = fila.aplica ? 'X' : 'N/A'
        })
      }
    }

    // Sincronizar dinámicamente el supervisor asignado real en Fila 14 y Fila 3
    sincronizarSupervisorConFilas()
  } else {
    const f = localStorage.getItem('ultima_firma')
    if (f) firmaGuardada.value = f
    sincronizarSupervisorConFilas()
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
  border-bottom: 1px solid #000000;
  min-height: 25px;
}

.celda-nombre-contratista {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 3px 6px;
  border-right: 1px solid #000000;
}

.celda-identificacion-header {
  width: 22%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-weight: 800;
  padding: 3px 6px;
}

.fila-contratista-2 {
  display: flex;
  border-bottom: 1px solid #000000;
  min-height: 25px;
}

.bloque-ciudad-fecha-regional {
  flex: 1;
  display: flex;
  border-right: 1px solid #000000;
}

.celda-identificacion-valor {
  width: 22%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-weight: 700;
  padding: 3px 6px;
}

.celda-ciudad-lbl {
  width: 55px;
  flex-shrink: 0;
}

.celda-ciudad-val {
  flex: 1.2;
  border-right: 1px solid #000000;
}

.celda-fecha-lbl {
  width: 50px;
  flex-shrink: 0;
}

.celda-fecha-val {
  flex: 1;
  border-right: 1px solid #000000;
}

.celda-regional-lbl {
  width: 70px;
  flex-shrink: 0;
  border-right: 1px solid #000000;
}

.celda-regional-val {
  flex: 1.5;
}

.fila-contratista-3 {
  display: flex;
  border-bottom: 1px solid #000000;
  min-height: 25px;
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
  min-height: 25px;
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
  border-right: 1px solid #000000;
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
  min-height: 24.5px;
}

.tr-row:last-child {
  border-bottom: none;
}

.td-dep {
  border-right: 1px solid #000000;
  padding: 3px 5px;
  display: flex;
  align-items: center;
  font-size: 7.2px;
  line-height: 1.2;
}

.td-marca {
  border-right: 1.5px solid #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9.5px;
  font-weight: 800;
}

.td-nombres {
  border-right: 1px solid #000000;
  padding: 3px 5px;
  display: flex;
  align-items: center;
  font-size: 7.2px;
  line-height: 1.2;
}

.td-firma {
  padding: 2px 4px;
  min-height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.img-firma-tabla {
  max-width: 105px;
  max-height: 21px;
  object-fit: contain;
  display: block;
}

.btn-firmar-fila {
  display: inline-flex;
  align-items: center;
  color: #1976d2;
  font-size: 7.5px;
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
  min-height: 44px;
  padding: 3px 6px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.lineas-puntos-elementos {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 13px;
  padding: 8px 0 3px;
}

.linea-punto {
  border-bottom: 1px solid #000000;
  width: 100%;
  height: 1px;
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
  padding: 3px 6px 6px;
  min-height: 26px;
}

.otros-label {
  white-space: nowrap;
  margin-right: 4px;
  font-weight: 700;
  font-size: 7.5px;
}

.otros-puntos {
  flex: 1;
  border-bottom: 1px solid #000000;
  height: 1px;
  margin-bottom: 2px;
}

.linea-separador-inf {
  border-bottom: 1.5px solid #000000;
  width: 100%;
}

.zona-firma-inf {
  min-height: 86px;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  padding: 8px 30px 12px 8px;
}

.caja-firma-contratista {
  width: 190px;
  text-align: center;
}

.contenedor-firma-img {
  width: 100%;
  height: 64px;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  margin-bottom: 3px;
}

.img-firma-estampada {
  max-width: 185px;
  max-height: 60px;
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
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.3px;
  color: #000000;
  text-align: center;
}

/* ===================== ESTILOS DEPENDENCIAS NO APLICAN (N/A) ===================== */
.tr-no-aplica {
  background-color: #fafbfc;
}

.td-marca-na {
  color: #616161;
  font-size: 7px;
  font-weight: 800;
}

.td-nombres-na {
  color: #757575;
  font-style: italic;
}

.texto-na-detalle {
  font-size: 6.5px;
  color: #8c8c8c;
}

.badge-na-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.badge-na {
  display: inline-block;
  padding: 1px 5px;
  background-color: #eceff1;
  color: #607d8b;
  border-radius: 3px;
  font-size: 6.5px;
  font-weight: 700;
  text-transform: uppercase;
  border: 1px solid #cfd8dc;
  letter-spacing: 0.3px;
}

.badge-na-print {
  display: none;
  font-size: 7.5px;
  font-weight: 700;
  color: #000000;
}

.only-print {
  display: none !important;
}

.p-card {
  transition: all 0.2s ease;
  border: 1.5px solid #e0e0e0;
}

.p-card:hover {
  border-color: #26a69a;
}

.border-primary-active {
  border-color: #2e7d32 !important;
  box-shadow: 0 0 0 1px #2e7d32;
}

.fila-config-item {
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  transition: background-color 0.2s ease;
}

.opacity-75 {
  opacity: 0.75;
}

/* ===================== IMPRESIÓN OFICIAL 1 HOJA GCCON-F-088 ===================== */
@media print {
  @page {
    size: letter portrait;
    margin: 5mm 7mm;
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
    height: auto !important;
    font-family: Arial, Helvetica, sans-serif !important;
  }

  .toolbar,
  .no-print,
  .banner-alerta-pantalla {
    display: none !important;
  }

  .only-print {
    display: inline-block !important;
  }

  .badge-na-container .no-print {
    display: none !important;
  }

  .badge-na-print {
    display: inline-block !important;
    font-size: 8px !important;
    font-weight: 800 !important;
  }

  .tr-no-aplica {
    background-color: #ffffff !important;
  }

  .page-formato {
    background: #ffffff !important;
    padding: 0 !important;
    margin: 0 !important;
    min-height: auto !important;
    height: auto !important;
  }

  .documento-wrapper {
    overflow: visible !important;
    padding: 0 !important;
    margin: 0 auto !important;
    display: block !important;
    max-width: none !important;
    width: 100% !important;
  }

  .documento {
    width: 100% !important;
    max-width: 820px !important;
    min-width: 0 !important;
    margin: 0 auto !important;
    border: 1.5px solid #000000 !important;
    box-shadow: none !important;
    background: #ffffff !important;
    page-break-after: avoid !important;
    page-break-before: avoid !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  .tr-row {
    min-height: 25px !important;
  }

  .td-dep,
  .td-nombres {
    font-size: 7.3px !important;
  }

  .espacio-elementos {
    min-height: 48px !important;
  }

  .zona-firma-inf {
    min-height: 88px !important;
  }

  .contenedor-firma-img {
    height: 65px !important;
  }

  .img-firma-estampada {
    max-height: 62px !important;
  }

  .marca-agua-rechazado {
    color: rgba(211, 47, 47, 0.28) !important;
    border-color: rgba(211, 47, 47, 0.35) !important;
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
