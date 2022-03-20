<template>
  <div class="flex p-6">
    <div class="mx-auto grid grid-rows-10 gap-4">
      <div v-for="(r, row) in itemsRef" class="grid grid-cols-10 gap-4">
        <div
          v-for="(c, column) in itemsRef"
          :ref="elementsApi.getRef(row, column)"
          class="h-[3em] w-[3em] flex items-center justify-center p-1 bg-blue-200 text-blue-900 font-mono rounded"
        >
          {{ `${r}.${c}` }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, shallowRef } from 'vue'
import { usePickable } from '@baleada/vue-composition';
import { useElementApi } from '../../../../../../src/extracted';
import { createEligibleInPlanePicking } from '../../../../../../src/extracted/createEligibleInPlanePicking';
import { WithGlobals } from '../../../../../fixtures/types';
import { items } from './items'

const itemsRef = shallowRef(items);

const elementsApi = useElementApi({ kind: 'plane', identified: true });

const rows = usePickable<HTMLElement[]>([]);
const columns = usePickable<HTMLElement>([]);

onMounted(() => {
  rows.value.array = elementsApi.elements.value
  columns.value.array = elementsApi.elements.value[0]
});

const abilities = itemsRef.value.map(() => [
  ...new Array(2).fill('disabled'),
  ...new Array(6).fill('enabled'),
  ...new Array(2).fill('disabled')
])
const ability = (row, column) => abilities[row][column]

;(window as unknown as WithGlobals).testState = {
  rows,
  columns,
  elementsApi,
  ability,
  eligiblePicking: createEligibleInPlanePicking({
    rows,
    columns,
    ability,
    elementsApi,
  }),
}

</script>
