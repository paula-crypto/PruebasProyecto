require('dotenv').config();
const conectarDB = require('../src/config/db');
const mongoose = require('mongoose');
const Contrato = require('../src/models/Contrato');
const BienEntregado = require('../src/models/BienEntregado');
const DependenciaArea = require('../src/models/DependenciaArea');

// Migra datos legacy:
// 1. Contratos con `dependencia` en String -> ObjectId (mapeando por nombre).
// 2. Reporta bienes huérfanos (sin contrato_id).
async function migrar() {
  try {
    await conectarDB();

    // 1. Contratos con dependencia en texto
    const contratos = await Contrato.find({}).lean();
    const dependencias = await DependenciaArea.find({}).lean();
    const mapa = new Map(dependencias.map(d => [d.nombre_dependencia.toLowerCase(), d._id]));

    let corregidos = 0;
    let sinMapeo = 0;

    for (const c of contratos) {
      if (typeof c.dependencia === 'string') {
        const id = mapa.get(c.dependencia.toLowerCase());
        if (id) {
          await Contrato.updateOne({ _id: c._id }, { $set: { dependencia: id } });
          console.log(`✔ Contrato ${c.numero_contrato}: dependencia "${c.dependencia}" -> ObjectId`);
          corregidos++;
        } else {
          console.log(`⚠ Contrato ${c.numero_contrato}: sin mapeo para dependencia "${c.dependencia}"`);
          sinMapeo++;
        }
      }
    }

    // 2. Bienes huérfanos (sin contrato_id)
    const huerfanos = await BienEntregado.countDocuments({ $or: [{ contrato_id: null }, { contrato_id: { $exists: false } }] });
    if (huerfanos > 0) {
      console.log(`⚠ ${huerfanos} bien(es) sin contrato_id (huérfanos). Revisar manualmente.`);
    }

    console.log(`\nResumen: ${corregidos} contrato(s) corregido(s), ${sinMapeo} sin mapeo, ${huerfanos} bien(es) huérfano(s).`);
    process.exit(0);
  } catch (error) {
    console.error('Error en migración:', error.message);
    process.exit(1);
  }
}

migrar();
