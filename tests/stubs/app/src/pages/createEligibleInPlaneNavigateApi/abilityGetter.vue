<template>
  <div class="flex p-6">
    <div class="grid gap-4 mx-auto grid-rows-10">
      <div v-for="(r, row) in itemsRef" class="grid grid-cols-10 gap-4">
        <div
          v-for="(c, column) in itemsRef"
          :ref="api.ref([row, column], { ability: abilities[row][column] })"
          class="h-[3em] w-[3em] flex items-center justify-center p-1 bg-blue-200 text-blue-900 font-mono rounded"
        >
          {{ `${r}.${c}` }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, shallowRef } from 'vue'
import { useNavigateable } from '@baleada/vue-composition';
import { usePlaneApi } from '../../../../../../src/extracted/usePlaneApi';
import { createEligibleInPlaneNavigateApi } from '../../../../../../src/extracted/createEligibleInPlaneNavigateApi';
import { items } from './items'

const itemsRef = shallowRef(items);

const api = usePlaneApi({
  identifies: true,
  defaultMeta: { ability: 'enabled' as 'enabled' | 'disabled' }
});

const rows = useNavigateable<HTMLElement[]>([]);
const columns = useNavigateable<HTMLElement>([]);

onMounted(() => {
  rows.array = api.plane.value
  columns.array = api.plane.value[0]
});

const abilities = itemsRef.value.map(() => [
  ...new Array(2).fill('disabled'),
  ...new Array(6).fill('enabled'),
  ...new Array(2).fill('disabled')
])

window.testState = {
  rows,
  columns,
  api,
  eligibleNavigateApi: createEligibleInPlaneNavigateApi({
    disabledElementsAreEligibleLocations: false,
    rows,
    columns,
    loops: false,
    api,
  }),
}

</script>
