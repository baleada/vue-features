<template>
  <ul>
    <li v-for="(item, index) in itemsRef" :ref="elementsApi.getRef(index)">
      {{ item }}
    </li>
  </ul>
</template>

<script setup lang="ts">
import { onMounted, shallowRef } from 'vue'
import { usePickable } from '@baleada/vue-composition';
import { useElementApi } from '../../../../../../src/extracted';
import { createEligiblePicking } from '../../../../../../src/extracted/createEligiblePicking';
import { WithGlobals } from '../../../../../fixtures/types';
import { items } from './items'

const itemsRef = shallowRef(items);

const elementsApi = useElementApi({ multiple: true, identified: true });

const pickable = usePickable<HTMLElement>([]);

onMounted(() => {
  pickable.value.array = elementsApi.elements.value
});


(window as unknown as WithGlobals).testState = {
  pickable,
  elementsApi,
  eligiblePicking: createEligiblePicking({
    pickable,
    ability: 'enabled',
    elementsApi,
  }),
}

</script>
