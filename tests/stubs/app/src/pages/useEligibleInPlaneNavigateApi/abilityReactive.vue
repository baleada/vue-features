<template>
  <div class="flex p-6">
    <div class="grid gap-4 mx-auto grid-rows-10">
      <div
        v-for="(r, row) in itemsRef" class="grid grid-cols-10 gap-4"
        :key="rowKeys[row]"
      >
        <div
          v-for="(c, column) in r"
          :key="c"
          :ref="api.ref({ row, column }, { ability: abilities[row][column] })"
          class="h-[3em] w-[3em] flex items-center justify-center p-1 bg-blue-200 text-blue-900 font-mono rounded"
        >
          {{ `${row}.${c}` }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNavigateable } from '@baleada/vue-composition';
import { createReorder } from '@baleada/logic';
import { usePlaneApi } from '../../../../../../src/extracted/usePlaneApi';
import { useEligibleInPlaneNavigateApi } from '../../../../../../src/extracted/useEligibleInPlaneNavigateApi';
import { items } from './items'

const itemsRef = ref(items);
let rowKeys = new Array(10).fill(0).map((_, index) => index)

const api = usePlaneApi({
  identifies: true,
  defaultMeta: { ability: 'enabled' as 'enabled' | 'disabled' }
});

const rows = useNavigateable<HTMLElement[]>([])
const columns = useNavigateable<HTMLElement>([])

onMounted(() => {
  rows.array = api.plane.value
  columns.array = api.plane.value[0]
})

const abilities = ref(new Array(10).fill(new Array(10).fill('disabled')))

window.testState = {
  rows,
  columns,
  api,
  abilities,
  eligibleNavigateApi: useEligibleInPlaneNavigateApi({
    disabledElementsAreEligibleLocations: false,
    rows,
    columns,
    loops: false,
    api,
  }),
  reorderRows: () => {
    rowKeys = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
    itemsRef.value = createReorder<number[]>(0, 9)(itemsRef.value)
  },
  reorderColumns: () => itemsRef.value = itemsRef.value.map(row => createReorder<number>(0, 9)(row)),
  removeRow: () => itemsRef.value = itemsRef.value.slice(0, -1),
  removeColumn: () => itemsRef.value = itemsRef.value.map(row => row.slice(0, -1)),
  removeRowAndColumn: () => itemsRef.value = itemsRef.value.slice(0, -1).map(row => row.slice(0, -1)),
}
</script>
