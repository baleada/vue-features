<template>
  <div class="grid grid-cols-3 grid-rows-2">
    <template v-for="(row, rowIndex) in rows">
      <span
        v-for="(column, columnIndex) in columns"
        :key="`${row},${column}`"
        :ref="api.ref(rowIndex, columnIndex)"
      >{{ `${row},${column}` }}</span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { identify } from '../../../../../../src/affordances/identify'
import { usePlaneApi } from '../../../../../../src/extracted/usePlaneApi'

const api = usePlaneApi(),
      rows = ref([0, 1]),
      columns = ref([0, 1, 2]),
      ids = identify(api.plane)

window.testState =  { ids }
</script>
