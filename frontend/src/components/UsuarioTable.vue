<template>
  <q-table
    title="Listado de Usuarios"
    :rows="rows"
    :columns="columns"
    row-key="documento"
    flat
    bordered
  >
    <template #body-cell-acciones="props">
      <q-td :props="props">
        <q-btn flat round color="primary" icon="edit" />

        <q-btn flat round color="negative" icon="delete" />
      </q-td>
    </template>
  </q-table>
</template>

<script setup>
defineProps({
  rows: Array,
  columns: Array,
})
</script>
