<template>
  <div class="flex p-6">
    <div class="mx-auto grid grid-rows-10 gap-4">
      <div v-for="(r, row) in itemsRef" class="grid grid-cols-10 gap-4">
        <div
          v-for="(c, column) in itemsRef"
          :ref="plane.getRef(row, column)"
          class="h-[3em] w-[3em] flex items-center justify-center p-1 bg-blue-200 text-blue-900 font-mono rounded"
        >
          {{ `${r}.${c}` }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePickable } from '@baleada/vue-composition';
import { createReorder } from '@baleada/logic';
import { useElementApi } from '../../../../../../src/extracted';
import { createEligibleInPlanePicking } from '../../../../../../src/extracted/createEligibleInPlanePicking';
import { WithGlobals } from '../../../../../fixtures/types';
import { items } from './items'

const itemsRef = ref(items);

const plane = useElementApi({ kind: 'plane', identified: true });

const rows = usePickable<HTMLElement[]>([])
const columns = usePickable<HTMLElement>([])

onMounted(() => {
  rows.value.array = plane.elements.value
  columns.value.array = plane.elements.value[0]
})

const abilities = ref(new Array(10).fill(new Array(10).fill('disabled')))
const ability = (row, column) => abilities.value[row][column]


;(window as unknown as WithGlobals).testState = {
  rows,
  columns,
  plane,
  ability,
  abilities,
  eligiblePicking: createEligibleInPlanePicking({
    rows,
    columns,
    ability: {
      get: ability,
      watchSource: abilities,
    },
    plane,
  }),
  reorder: () => itemsRef.value = createReorder<number>(0, 9)(itemsRef.value),
  remove: () => itemsRef.value = itemsRef.value.slice(0, 5),
  removeAndReorder: () => itemsRef.value = createReorder<number>(0, 9)(itemsRef.value).slice(0, 5),
}
</script>
