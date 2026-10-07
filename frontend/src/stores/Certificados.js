import { defineStore } from 'pinia'

const certificadosIniciales = JSON.parse(localStorage.getItem('gccon_certificados')) || [
  {
    id: 'CERT-2026-001',
    contratistaDocumento: '1098765432',
    contratistaNombre: 'Paula Valentina Rache Fonseca',
    numeroContrato: 'CT-2026-088',
    dependenciaCodigo: 'DEP-001',
    dependenciaNombre: 'Sistemas e Informática',
    fechaSolicitud: '2026-08-15',
    estado: 'Pendiente',
    observaciones: 'Pendiente entrega de inventarios de software.',
  },
  {
    id: 'CERT-2026-002',
    contratistaDocumento: '1098765432',
    contratistaNombre: 'Paula Valentina Rache Fonseca',
    numeroContrato: 'CT-2026-088',
    dependenciaCodigo: 'DEP-002',
    dependenciaNombre: 'Almacén e Inventarios',
    fechaSolicitud: '2026-08-10',
    estado: 'Aprobado',
    observaciones: 'Paz y salvo de equipos al día.',
  },
]

export const useCertificadosStore = defineStore('certificados', {
  state: () => ({
    certificados: certificadosIniciales,
  }),

  actions: {
    guardarEnStorage() {
      localStorage.setItem('gccon_certificados', JSON.stringify(this.certificados))
    },

    agregar(solicitud) {
      const nuevoId = `CERT-2026-${(this.certificados.length + 1).toString().padStart(3, '0')}`
      this.certificados.unshift({
        id: nuevoId,
        fechaSolicitud: new Date().toISOString().substring(0, 10),
        estado: 'Pendiente',
        ...solicitud,
      })
      this.guardarEnStorage()
    },

    actualizarEstado(id, nuevoEstado, observaciones = '') {
      const index = this.certificados.findIndex((c) => c.id === id)
      if (index !== -1) {
        this.certificados[index].estado = nuevoEstado
        if (observaciones) {
          this.certificados[index].observaciones = observaciones
        }
        this.guardarEnStorage()
      }
    },

    eliminar(id) {
      this.certificados = this.certificados.filter((c) => c.id !== id)
      this.guardarEnStorage()
    },
  },
})
