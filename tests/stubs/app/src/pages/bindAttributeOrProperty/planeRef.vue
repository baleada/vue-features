<template>
  <div class="grid grid-rows-2 grid-cols-3">
    <template v-for="(row, rowIndex) in rows">
      <span
        v-for="(column, columnIndex) in columns"
        :key="`${row},${column}`"
        :ref="api.getRef(rowIndex, columnIndex)"
        :class="`${row},${column}`"
      >{{ `${row},${column}` }}</span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { WithGlobals } from '../../../../../fixtures/types'
import { useElementApi } from '../../../../../../src/extracted/useElementApi'
import { bindAttributeOrProperty } from '../../../../../../src/extracted/bindAttributeOrProperty'

const api = useElementApi({ kind: 'plane' }),
      rows = ref([0, 1]),
      columns = ref([0, 1, 2]),
      count = ref(0),
      increaseCount = () => count.value++

bindAttributeOrProperty(
  api.elements,
  'id',
  count,
  [],
)

;(window as unknown as WithGlobals).testState =  { increaseCount }
</script>
