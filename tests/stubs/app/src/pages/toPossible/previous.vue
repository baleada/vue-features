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
import { createToPreviousPossible } from '../../../../../../src/extracted/createToPossible';
import { WithGlobals } from '../../../../../fixtures/types';
import { items } from '../possibleNavigation/items'

const itemsRef = shallowRef(items);

const elementsApi = useElementApi({ multiple: true, identified: true });

(window as unknown as WithGlobals).testState = {
  elementsApi,
  toPreviousPossible: createToPreviousPossible({
    elementsApi,
    loops: false,
  }),
  toPreviousPossible_loops: createToPreviousPossible({
    elementsApi,
    loops: true,
  })
}

</script>
