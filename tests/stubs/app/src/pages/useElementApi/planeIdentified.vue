<template>
  <div class="flex items-center gap-4">
    <button class="p-2 border border-gray-400 rounded" @click="() => shouldAddRow = true">add row</button>
    <button class="p-2 border border-gray-400 rounded" @click="() => shouldAddColumn = true">add column</button>
    <button class="p-2 border border-gray-400 rounded" @click="() => shouldReorderRows = true">reorder rows</button>
    <button class="p-2 border border-gray-400 rounded" @click="() => shouldReorderFirstRow = true">reorder first row</button>
    <button class="p-2 border border-gray-400 rounded" @click="() => shouldReorderColumns = true">reorder columns</button>
  </div>
  <div class="w-24 grid gap-4">
    <div
      v-for="(rowNum, row) in rows"
      class="grid gap-4"
      :class="[shouldAddColumn ? 'grid-cols-4' : 'grid-cols-3']"
    >
      <span
        v-for="(colNum, column) in getColumns(row)"
        :key="(rowNum * (shouldAddColumn ? 4 : 3)) + colNum"
        :ref="elementsApi.getRef(row, column)"
        class="h-full w-full flex items-center justify-center bg-emerald-600 text-emerald-50"
      >{{ (rowNum * (shouldAddColumn ? 4 : 3)) + colNum }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useElementApi } from '../../../../../../src/extracted/useElementApi'
import { WithGlobals } from '../../../../../fixtures/types';

const shouldAddRow = ref(false)
const shouldAddColumn = ref(false)
const shouldReorderRows = ref(false)
const shouldReorderColumns = ref(false)
const shouldReorderFirstRow = ref(false)

const rows = computed(() => {
  const total = shouldAddRow.value ? 3 : 2

  return shouldReorderRows.value
    ? new Array(total).fill(0).map((_, index) => index).sort((a, b) => b - a)
    : new Array(total).fill(0).map((_, index) => index)
})

function getColumns (r) {
  const total = shouldAddColumn.value ? 4 : 3

  let c

  if (shouldReorderColumns.value) {
    c = new Array(total).fill(0).map((_, index) => index).sort((a, b) => b - a)
  } else {
    c = new Array(total).fill(0).map((_, index) => index)
  }

  if (shouldReorderFirstRow.value && r === 0) {
    c = c.slice().reverse()
  }

  return c
}


const elementsApi = useElementApi({ kind: 'plane', identified: true });

(window as unknown as WithGlobals).testState =  { elementsApi }
</script>
