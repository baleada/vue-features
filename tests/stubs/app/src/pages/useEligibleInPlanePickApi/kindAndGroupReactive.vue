<template>
  <div class="flex p-6">
    <div class="grid gap-4 mx-auto grid-rows-10">
      <div v-for="(r, row) in itemsRef" class="grid grid-cols-10 gap-4">
        <div
          v-for="(c, column) in itemsRef"
          :ref="api.ref({ row, column }, { kind: kinds[row][column], group: groups[row][column] })"
          :data-kind="kinds[row][column]"
          :data-group="groups[row][column]"
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
import { usePlaneApi } from '../../../../../../src/extracted/usePlaneApi';
import { useEligibleInPlanePickApi } from '../../../../../../src/extracted/useEligibleInPlanePickApi';
import { items } from './items'

const itemsRef = ref(items);

const api = usePlaneApi({
  identifies: true,
  defaultMeta: {
    kind: 'item' as 'item' | 'radio' | 'checkbox',
    group: '',
  }
});

const rows = usePickable<HTMLElement[]>([])
const columns = usePickable<HTMLElement>([])

onMounted(() => {
  rows.array = api.plane.value
  columns.array = api.plane.value[0]
})

const kinds = ref(new Array(10).fill(new Array(10).fill('item')))
const groups = ref(new Array(10).fill(new Array(10).fill('')))

window.testState = {
  rows,
  columns,
  api,
  kinds,
  groups,
  eligiblePickApi: useEligibleInPlanePickApi({
    rows,
    columns,
    api,
  }),
  reorder: () => itemsRef.value = createReorder<number>(0, 9)(itemsRef.value),
  remove: () => itemsRef.value = itemsRef.value.slice(0, 5),
  removeAndReorder: () => itemsRef.value = createReorder<number>(0, 9)(itemsRef.value).slice(0, 5),
}
</script>
