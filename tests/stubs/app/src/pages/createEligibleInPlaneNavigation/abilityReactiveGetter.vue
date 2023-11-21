<template>
  <div class="flex p-6">
    <div class="grid gap-4 mx-auto grid-rows-10">
      <div v-for="(r, row) in itemsRef" class="grid grid-cols-10 gap-4">
        <div
          v-for="(c, column) in itemsRef"
          :ref="plane.getRef(row, column, { ability: abilities[row][column] })"
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
import { useNavigateable } from '@baleada/vue-composition';
import { createReorder } from '@baleada/logic';
import { useElementApi } from '../../../../../../src/extracted';
import { createEligibleInPlaneNavigation } from '../../../../../../src/extracted/createEligibleInPlaneNavigation';
import { items } from './items'

const itemsRef = ref(items);

const plane = useElementApi({
  kind: 'plane',
  identifies: true,
  defaultMeta: { ability: 'enabled' as 'enabled' | 'disabled' }
});

const rows = useNavigateable<HTMLElement[]>([])
const columns = useNavigateable<HTMLElement>([])

onMounted(() => {
  rows.array = plane.elements.value
  columns.array = plane.elements.value[0]
})

const abilities = ref(new Array(10).fill(new Array(10).fill('disabled')))

window.testState = {
  rows,
  columns,
  plane,
  abilities,
  eligibleNavigation: createEligibleInPlaneNavigation({
    disabledElementsAreEligibleLocations: false,
    rows,
    columns,
    loops: false,
    plane,
  }),
  reorder: () => itemsRef.value = createReorder<number>(0, 9)(itemsRef.value),
  remove: () => itemsRef.value = itemsRef.value.slice(0, 5),
  removeAndReorder: () => itemsRef.value = createReorder<number>(0, 9)(itemsRef.value).slice(0, 5),
}
</script>
