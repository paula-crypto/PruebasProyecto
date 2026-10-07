<template>
  <q-card class="dashboard-card bg-white shadow-1" flat bordered>
    <q-card-section class="row items-center justify-between no-wrap q-pa-md">
      <div>
        <div class="text-grey-7 text-subtitle2 text-weight-medium">
          {{ titulo }}
        </div>

        <div class="text-h4 text-weight-bold text-grey-9 q-mt-xs">
          {{ cantidad }}
        </div>
      </div>

      <div class="icon-container flex flex-center rounded-borders">
        <q-icon :name="icono" size="32px" color="primary" />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
defineProps({
  titulo: {
    type: String,
    default: 'Métrica',
  },
  cantidad: {
    type: Number,
    default: 0,
  },
  icono: {
    type: String,
    default: 'analytics',
  },
})
</script>

<style scoped>
.dashboard-card {
  border-radius: 14px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
}

.dashboard-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12) !important;
}

.icon-container {
  width: 56px;
  height: 56px;
  background-color: rgba(57, 169, 0, 0.1);
  border-radius: 12px;
}
</style>
