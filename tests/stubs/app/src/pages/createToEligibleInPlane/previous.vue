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
import { shallowRef } from 'vue'
import { useElementApi } from '../../../../../../src/extracted';
import { createToPreviousEligible } from '../../../../../../src/extracted/createToEligibleInPlane';
import { items } from './items'

const itemsRef = shallowRef(items);

const plane = useElementApi({ kind: 'plane', identified: true })


window.testState = {
  plane,
  toPreviousEligible: createToPreviousEligible({
    plane,
    loops: false,
    iterateOver: 'column'
  }),
  toPreviousEligible_loops: createToPreviousEligible({
    plane,
    loops: true,
    iterateOver: 'column'
  }),
  toPreviousEligible_row: createToPreviousEligible({
    plane,
    loops: true,
    iterateOver: 'row'
  })
}

</script>
