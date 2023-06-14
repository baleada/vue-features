<template>
  <div class="grid grid-rows-2 grid-cols-3">
    <template v-for="(row, rowIndex) in rows">
      <span
        v-for="(column, columnIndex) in columns"
        :key="`${row},${column}`"
        :ref="api.getRef(rowIndex, columnIndex)"
      >{{ `${row},${column}` }}</span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useElementApi } from '../../../../../../src/extracted/useElementApi'
import { bindAttributeOrProperty } from '../../../../../../src/extracted/bindAttributeOrProperty'

const api = useElementApi({ kind: 'plane' }),
      rows = ref([0, 1]),
      columns = ref([0, 1, 2])

bindAttributeOrProperty(
  api.elements,
  'id',
  (row, column) => `${row}${column}`,
  [],
)

window.testState =  { }
</script>
