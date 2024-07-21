<template>
  <div class="grid grid-rows-2 grid-cols-3">
    <template v-for="(row, rowIndex) in rows">
      <span
        v-for="(column, columnIndex) in columns"
        :key="`${row},${column}`"
        :ref="api.ref({ row: rowIndex, column: columnIndex })"
      >{{ `${row},${column}` }}</span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { usePlaneApi } from '../../../../../../src/extracted/usePlaneApi'
import { bindList } from '../../../../../../src/extracted/bindList'

const api = usePlaneApi(),
      rows = ref([0, 1]),
      columns = ref([0, 1, 2])

bindList(
  api.plane,
  'class',
  'stub',
  [],
)

window.testState =  {  }
</script>
