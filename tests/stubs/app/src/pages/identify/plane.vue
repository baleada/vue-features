<template>
  <div class="grid grid-cols-3 grid-rows-2">
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
import { identify } from '../../../../../../src/affordances/identify'
import { useElementApi } from '../../../../../../src/extracted/useElementApi'

const api = useElementApi({ kind: 'plane' }),
      rows = ref([0, 1]),
      columns = ref([0, 1, 2]),
      ids = identify(api.elements)

window.testState =  { ids }
</script>
