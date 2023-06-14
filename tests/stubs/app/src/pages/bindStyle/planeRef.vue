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
import { bindStyle } from '../../../../../../src/extracted/bindStyle'

const api = useElementApi({ kind: 'plane' }),
      rows = ref([0, 1]),
      columns = ref([0, 1, 2]),
      color = ref('red')

bindStyle(
  api.elements,
  'backgroundColor',
  color,
  [],
)

window.testState =  { color }
</script>
