<template>
  <div class="grid grid-cols-3 grid-rows-2">
    <template v-for="(row, rowIndex) in rows">
      <span
        v-for="(column, columnIndex) in columns"
        :key="`${row},${column}`"
        :ref="api.ref([rowIndex, columnIndex])"
      >{{ `${row},${column}` }}</span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { usePlaneApi } from '../../../../../../src/extracted/usePlaneApi'
import { bindStyle } from '../../../../../../src/extracted/bindStyle'

const api = usePlaneApi(),
      rows = ref([0, 1]),
      columns = ref([0, 1, 2]),
      colors = ['red', 'blue', 'green', 'purple', 'orange', 'yellow']

bindStyle(
  api.plane,
  'backgroundColor',
  ([row, column]) => colors[row * 3 + column],
  [],
)

window.testState =  { }
</script>
