const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Genera el documento oficial GCCON-F-088 del SENA
 * Entrega de Bienes e Información de Ejecución Contractual por el Contratista
 */
const generarPdf = async ({ contrato, bienes = [], firmas = [], firma_base64 = null }) => {
  const tmpDir = path.join(__dirname, '../../tmp');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const filename = `pazysalvo_${contrato._id}.pdf`;
  const filepath = path.join(tmpDir, filename);

  const doc = new PDFDocument({
    size: 'LETTER',
    margins: { top: 30, bottom: 30, left: 35, right: 35 },
    bufferPages: true
  });

  const stream = fs.createWriteStream(filepath);
  doc.pipe(stream);

  const greenSena = '#39a900';
  const darkNavy = '#0f172a';
  const greyLight = '#f1f5f9';
  const borderGrey = '#94a3b8';
  const textDark = '#1e293b';

  const startX = 35;
  const pageWidth = 542; // 612 - 70

  // 1. ENCABEZADO OFICIAL
  doc.rect(startX, 30, pageWidth, 55).stroke(borderGrey);

  // Logo SENA
  const logoPath = path.join(__dirname, '../assets/logo-sena.png');
  if (fs.existsSync(logoPath)) {
    try {
      doc.image(logoPath, startX + 15, 36, { fit: [80, 42] });
    } catch (e) {
      doc.fontSize(14).font('Helvetica-Bold').fillColor(greenSena).text('SENA', startX + 15, 45);
    }
  }

  // Título central
  doc.fontSize(10).font('Helvetica-Bold').fillColor(darkNavy)
    .text('SERVICIO NACIONAL DE APRENDIZAJE - SENA', startX + 110, 40, { width: 300, align: 'center' });
  doc.fontSize(8).font('Helvetica')
    .text('SISTEMA INTEGRADO DE GESTIÓN Y AUTOCONTROL', startX + 110, 53, { width: 300, align: 'center' });
  doc.fontSize(7).font('Helvetica-Bold').fillColor(greenSena)
    .text('FORMATO GCCON-F-088', startX + 110, 65, { width: 300, align: 'center' });

  // Cuadro Versión y Código
  doc.rect(startX + 420, 30, 122, 55).stroke(borderGrey);
  doc.fontSize(7).font('Helvetica-Bold').fillColor(textDark)
    .text('CÓDIGO:', startX + 425, 38)
    .font('Helvetica').text('GCCON-F-088', startX + 470, 38)
    .font('Helvetica-Bold').text('VERSIÓN:', startX + 425, 52)
    .font('Helvetica').text('1.0', startX + 470, 52)
    .font('Helvetica-Bold').text('FECHA:', startX + 425, 66)
    .font('Helvetica').text(new Date().toISOString().substring(0, 10), startX + 470, 66);

  // 2. BARRAS DE PROCESO Y FORMATO
  doc.rect(startX, 90, pageWidth, 16).fillAndStroke(darkNavy, darkNavy);
  doc.fontSize(8).font('Helvetica-Bold').fillColor('#ffffff')
    .text('PROCESO: GESTIÓN CONTRACTUAL', startX + 10, 94);

  doc.rect(startX, 108, pageWidth, 22).fillAndStroke(greyLight, borderGrey);
  doc.fontSize(8).font('Helvetica-Bold').fillColor(darkNavy)
    .text('ENTREGA DE BIENES E INFORMACIÓN DE EJECUCIÓN CONTRACTUAL POR EL CONTRATISTA', startX + 5, 114, { align: 'center', width: pageWidth });

  // 3. CLASIFICACIÓN DE LA INFORMACIÓN
  doc.rect(startX, 134, pageWidth, 20).stroke(borderGrey);
  doc.fontSize(7).font('Helvetica-Bold').fillColor(textDark)
    .text('CLASIFICACIÓN DE LA INFORMACIÓN:', startX + 8, 140)
    .font('Helvetica')
    .text('[ X ] Pública        [   ] Pública Clasificada        [   ] Pública Reservada', startX + 180, 140);

  // 4. INFORMACIÓN DEL CONTRATO
  doc.rect(startX, 158, pageWidth, 74).stroke(borderGrey);
  doc.rect(startX, 158, pageWidth, 14).fillAndStroke(greenSena, greenSena);
  doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#ffffff')
    .text('1. INFORMACIÓN GENERAL DEL CONTRATO Y CONTRATISTA', startX + 8, 161);

  const posY = 178;
  doc.fontSize(7.5).font('Helvetica-Bold').fillColor(textDark)
    .text('NÚMERO DE CONTRATO:', startX + 8, posY)
    .font('Helvetica').text(contrato.numero_contrato || 'N/A', startX + 120, posY)
    .font('Helvetica-Bold').text('ESTADO DEL TRÁMITE:', startX + 310, posY)
    .font('Helvetica').fillColor(greenSena).text(contrato.estado || 'Finalizado', startX + 420, posY);

  doc.font('Helvetica-Bold').fillColor(textDark)
    .text('NOMBRE CONTRATISTA:', startX + 8, posY + 16)
    .font('Helvetica').text(contrato.nombre_contratista || 'N/A', startX + 120, posY + 16)
    .font('Helvetica-Bold').text('TELÉFONO:', startX + 310, posY + 16)
    .font('Helvetica').text(contrato.telefono || 'N/A', startX + 420, posY + 16);

  doc.font('Helvetica-Bold')
    .text('CORREO ELECTRÓNICO:', startX + 8, posY + 32)
    .font('Helvetica').text(contrato.correo_contratista || 'N/A', startX + 120, posY + 32)
    .font('Helvetica-Bold').text('DEPENDENCIA:', startX + 310, posY + 32)
    .font('Helvetica').text(contrato.dependencia?.nombre_dependencia || 'SENA Regional', startX + 420, posY + 32);

  // 5. CAUSAL DE TERMINACIÓN
  doc.rect(startX, 236, pageWidth, 22).stroke(borderGrey);
  doc.fontSize(7).font('Helvetica-Bold').fillColor(textDark)
    .text('CAUSAL DE TERMINACIÓN:', startX + 8, 243)
    .font('Helvetica')
    .text('[ X ] Liquidación por Mutuo Acuerdo    [  ] Cesión    [  ] Liquidación Anticipada    [  ] Terminación Unilateral', startX + 130, 243);

  // 6. PAZ Y SALVO POR ÁREAS / RESPONSABLES
  let curY = 264;
  doc.rect(startX, curY, pageWidth, 14).fillAndStroke(darkNavy, darkNavy);
  doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#ffffff')
    .text('2. PAZ Y SALVO POR DEPENDENCIAS / RESPONSABLES DE ÁREA', startX + 8, curY + 3);

  curY += 15;
  // Encabezado de tabla de firmas
  doc.rect(startX, curY, pageWidth, 15).fillAndStroke(greyLight, borderGrey);
  doc.fontSize(7).font('Helvetica-Bold').fillColor(textDark)
    .text('DEPENDENCIA / ÁREA', startX + 5, curY + 4, { width: 170 })
    .text('RESPONSABLE', startX + 180, curY + 4, { width: 130 })
    .text('DICTAMEN', startX + 315, curY + 4, { width: 65, align: 'center' })
    .text('FECHA / HASH VERIFICACIÓN LEGAL', startX + 385, curY + 4, { width: 150 });

  curY += 15;
  if (firmas.length === 0) {
    doc.rect(startX, curY, pageWidth, 16).stroke(borderGrey);
    doc.fontSize(7).font('Helvetica').fillColor('#64748b')
      .text('No hay registros de firmas asociadas a este trámite.', startX + 10, curY + 5);
    curY += 16;
  } else {
    firmas.forEach((f) => {
      const nomArea = f.area_id?.nombre_dependencia || 'Área Técnica';
      const nomResp = f.usuario_id?.nombre_completo || 'Responsable Asignado';
      const fechaFirma = f.fecha_firma ? new Date(f.fecha_firma).toISOString().substring(0, 10) : 'Pendiente';
      const hashCorto = f.hash_verificacion ? f.hash_verificacion.substring(0, 18) + '...' : 'Sin hash';

      doc.rect(startX, curY, pageWidth, 18).stroke(borderGrey);
      doc.fontSize(6.8).font('Helvetica-Bold').fillColor(textDark)
        .text(nomArea, startX + 5, curY + 5, { width: 170 })
        .font('Helvetica')
        .text(nomResp, startX + 180, curY + 5, { width: 130 })
        .font('Helvetica-Bold').fillColor(f.estado === 'Aprobado' ? greenSena : '#ef4444')
        .text(f.estado || 'Aprobado', startX + 315, curY + 5, { width: 65, align: 'center' })
        .font('Courier').fillColor('#334155')
        .text(`${fechaFirma} | ${hashCorto}`, startX + 385, curY + 5, { width: 150 });
      curY += 18;
    });
  }

  curY += 6;
  // 7. RELACIÓN DE BIENES ENTREGADOS (INVENTARIO)
  doc.rect(startX, curY, pageWidth, 14).fillAndStroke(greenSena, greenSena);
  doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#ffffff')
    .text('3. RELACIÓN DE BIENES ENTREGADOS POR EL CONTRATISTA (INVENTARIO)', startX + 8, curY + 3);

  curY += 15;
  doc.rect(startX, curY, pageWidth, 15).fillAndStroke(greyLight, borderGrey);
  doc.fontSize(7).font('Helvetica-Bold').fillColor(textDark)
    .text('#', startX + 5, curY + 4, { width: 20 })
    .text('DESCRIPCIÓN DEL BIEN / ELEMENTO', startX + 30, curY + 4, { width: 230 })
    .text('CÓDIGO INVENTARIO', startX + 265, curY + 4, { width: 110 })
    .text('CANTIDAD', startX + 380, curY + 4, { width: 55, align: 'center' })
    .text('ESTADO DEL BIEN', startX + 440, curY + 4, { width: 95, align: 'center' });

  curY += 15;
  if (bienes.length === 0) {
    doc.rect(startX, curY, pageWidth, 16).stroke(borderGrey);
    doc.fontSize(7).font('Helvetica').fillColor('#64748b')
      .text('El contratista no registró bienes físicos asignados en esta vigencia.', startX + 10, curY + 5);
    curY += 16;
  } else {
    bienes.forEach((b, idx) => {
      doc.rect(startX, curY, pageWidth, 16).stroke(borderGrey);
      doc.fontSize(6.8).font('Helvetica').fillColor(textDark)
        .text(`${idx + 1}`, startX + 5, curY + 4, { width: 20 })
        .text(b.descripcion || '—', startX + 30, curY + 4, { width: 230 })
        .text(b.codigo_inventario || '—', startX + 265, curY + 4, { width: 110 })
        .text(`${b.cantidad || 1}`, startX + 380, curY + 4, { width: 55, align: 'center' })
        .text(b.estado_bien || 'Bueno', startX + 440, curY + 4, { width: 95, align: 'center' });
      curY += 16;
    });
  }

  curY += 10;
  // 8. OBLIGACIONES PENDIENTES / OBSERVACIONES
  doc.rect(startX, curY, pageWidth, 32).stroke(borderGrey);
  doc.fontSize(7).font('Helvetica-Bold').fillColor(textDark)
    .text('ELEMENTOS FALTANTES U OBLIGACIONES PENDIENTES:', startX + 8, curY + 6)
    .font('Helvetica')
    .text(contrato.observaciones_supervisor || 'Ninguna. El contratista se encuentra a paz y salvo por todo concepto con la entidad.', startX + 8, curY + 18, { width: pageWidth - 16 });

  curY += 40;
  const colFirmaW = (pageWidth - 20) / 2;
  const esRechazado = contrato.estado === 'Rechazado';

  // Marca de agua de seguridad si el trámite está Rechazado
  if (esRechazado) {
    doc.save();
    doc.rotate(-35, { origin: [startX + pageWidth / 2, 380] });
    doc.fontSize(34).font('Helvetica-Bold').fillColor('#dc2626', 0.2)
      .text('SOLICITUD RECHAZADA - NO VÁLIDO', startX + pageWidth / 2 - 260, 360, { width: 520, align: 'center' });
    doc.restore();
  }

  // Firma Contratista
  doc.rect(startX, curY, colFirmaW, 58).stroke(borderGrey);
  if (firma_base64 && !esRechazado) {
    try {
      const cleanBase64 = firma_base64.replace(/^data:image\/\w+;base64,/, '');
      const imgBuffer = Buffer.from(cleanBase64, 'base64');
      doc.image(imgBuffer, startX + (colFirmaW - 100) / 2, curY + 6, { fit: [100, 30], align: 'center' });
    } catch (err) {
      console.error('Error al estampar firma en PDF contratista:', err);
    }
  }
  doc.moveTo(startX + 20, curY + 40).lineTo(startX + colFirmaW - 20, curY + 40).stroke(textDark);
  doc.fontSize(7.5).font('Helvetica-Bold').fillColor(textDark)
    .text('FIRMA DEL CONTRATISTA', startX, curY + 44, { width: colFirmaW, align: 'center' })
    .font('Helvetica').fontSize(6.5)
    .text(contrato.nombre_contratista || '', startX, curY + 28, { width: colFirmaW, align: 'center' });

  // Firma Supervisor
  const startXSuper = startX + colFirmaW + 20;
  doc.rect(startXSuper, curY, colFirmaW, 58).stroke(borderGrey);
  if (firma_base64) {
    try {
      const cleanBase64 = firma_base64.replace(/^data:image\/\w+;base64,/, '');
      const imgBuffer = Buffer.from(cleanBase64, 'base64');
      doc.image(imgBuffer, startXSuper + (colFirmaW - 100) / 2, curY + 6, { fit: [100, 30], align: 'center' });
    } catch (err) {
      console.error('Error al estampar firma en PDF supervisor:', err);
    }
  }
  doc.moveTo(startXSuper + 20, curY + 40).lineTo(startXSuper + colFirmaW - 20, curY + 40).stroke(textDark);
  doc.fontSize(7.5).font('Helvetica-Bold').fillColor(textDark)
    .text('FIRMA DEL SUPERVISOR DE CONTRATO', startXSuper, curY + 44, { width: colFirmaW, align: 'center' })
    .font('Helvetica').fontSize(6.5)
    .text('Verificación y Cierre Autorizado', startXSuper, curY + 28, { width: colFirmaW, align: 'center' });

  // 10. PIE DE PÁGINA INSTITUCIONAL
  doc.fontSize(6.5).font('Helvetica').fillColor('#64748b')
    .text('Servicio Nacional de Aprendizaje - SENA | Formato GCCON-F-088 Gestión Contractual | Documento electrónico oficial con hash criptográfico SHA-256.', startX, 740, { width: pageWidth, align: 'center' });

  doc.end();

  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  return filepath;
};

module.exports = { generarPdf };
