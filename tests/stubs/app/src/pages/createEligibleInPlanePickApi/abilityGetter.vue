<template>
  <div class="flex p-6">
    <div class="grid gap-4 mx-auto grid-rows-10">
      <div v-for="(r, row) in itemsRef" class="grid grid-cols-10 gap-4">
        <div
          v-for="(c, column) in itemsRef"
          :ref="api.ref(row, column, { ability: abilities[row][column] })"
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
import { usePlaneApi } from '../../../../../../src/extracted/usePlaneApi';
import { createEligibleInPlanePickApi } from '../../../../../../src/extracted/createEligibleInPlanePickApi';
import { items } from './items'

const itemsRef = shallowRef(items);

const api = usePlaneApi({
  identifies: true,
  defaultMeta: { ability: 'enabled' as 'enabled' | 'disabled' }
});

const rows = usePickable<HTMLElement[]>([]);
const columns = usePickable<HTMLElement>([]);

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
  eligiblePickApi: createEligibleInPlanePickApi({
    rows,
    columns,
    api,
  }),
}

</script>
