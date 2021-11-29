<template>
  <ul>
    <li v-for="(item, index) in itemsRef" :ref="elementsApi.getRef(index)">
      {{ item }}
    </li>
  </ul>
</template>

<script setup lang="ts">
import { shallowRef } from 'vue'
import { useElementApi } from '../../../../../../src/extracted';
import { createToNextEligible } from '../../../../../../src/extracted/createToEligible';
import { WithGlobals } from '../../../../../fixtures/types';
import { items } from '../possibleNavigation/items'

const itemsRef = shallowRef(items);

const elementsApi = useElementApi({ multiple: true, identified: true });


(window as unknown as WithGlobals).testState = {
  elementsApi,
  toNextEligible: createToNextEligible({
    elementsApi,
    loops: false,
  }),
  toNextEligible_loops: createToNextEligible({
    elementsApi,
    loops: true,
  })
}

</script>
