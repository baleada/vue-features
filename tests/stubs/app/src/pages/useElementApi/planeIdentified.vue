<template>
  <div class="flex items-center gap-4">
    <button class="p-2 border border-gray-400 rounded" @click="() => shouldAddRow = true">add row</button>
    <button class="p-2 border border-gray-400 rounded" @click="() => shouldAddColumn = true">add column</button>
    <button class="p-2 border border-gray-400 rounded" @click="() => shouldReorder = true">reorder</button>
  </div>
  <div class="w-24 grid gap-4">
    <div
      v-for="(rowNum, row) in shouldAddRow ? new Array(3).fill(0).map((_, index) => index) : new Array(2).fill(0).map((_, index) => index)"
      class="grid gap-4"
      :class="[shouldAddColumn ? 'grid-cols-4' : 'grid-cols-3']"
    >
      <span
        v-for="(colNum, column) in shouldReorder ? new Array(shouldAddColumn ? 4 : 3).fill(0).map((_, index) => index).sort((a, b) => b - a) : new Array(shouldAddColumn ? 4 : 3).fill(0).map((_, index) => index)"
        :key="(rowNum * (shouldAddColumn ? 4 : 3)) + colNum"
        :ref="elementsApi.getRef(column, row)"
        class="h-full w-full flex items-center justify-center bg-emerald-600 text-emerald-50"
      >{{ (rowNum * (shouldAddColumn ? 4 : 3)) + colNum }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useElementApi } from '../../../../../../src/extracted/useElementApi'
import { WithGlobals } from '../../../../../fixtures/types';

const shouldAddRow = ref(false)
const shouldAddColumn = ref(false)
const shouldReorder = ref(false)

const elementsApi = useElementApi({ kind: 'plane', identified: true });

(window as unknown as WithGlobals).testState =  { elementsApi }
</script>
