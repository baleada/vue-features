<template>
  <div class="grid grid-rows-2 grid-cols-3">
    <template v-for="(row, rowIndex) in rows">
      <span
        v-for="(column, columnIndex) in columns"
        :key="`${row},${column}`"
        :ref="api.ref([rowIndex, columnIndex])"
        :class="`${row},${column}`"
      >{{ `${row},${column}` }}</span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { usePlaneApi } from '../../../../../../src/extracted/usePlaneApi'

const rows = ref([0, 1])
const columns = ref([0, 1, 2])
const api = usePlaneApi()

window.testState =  { api, rows, columns }
</script>
