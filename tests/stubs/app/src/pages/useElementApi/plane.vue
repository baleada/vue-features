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
import { ref } from 'vue';
import { useElementApi } from '../../../../../../src/extracted/useElementApi'
import { WithGlobals } from '../../../../../fixtures/types';

const rows = ref([0, 1])
const columns = ref([0, 1, 2])
const api = useElementApi({ kind: 'plane' })

;(window as unknown as WithGlobals).testState =  { api, rows, columns }
</script>
