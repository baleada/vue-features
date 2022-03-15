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
import { createToPreviousEligible } from '../../../../../../src/extracted/createToEligibleInList';
import { WithGlobals } from '../../../../../fixtures/types';
import { items } from './items'

const itemsRef = shallowRef(items);

const elementsApi = useElementApi({ kind: 'list', identified: true })

;(window as unknown as WithGlobals).testState = {
  elementsApi,
  toPreviousEligible: createToPreviousEligible({
    elementsApi,
    loops: false,
  }),
  toPreviousEligible_loops: createToPreviousEligible({
    elementsApi,
    loops: true,
  })
}

</script>
