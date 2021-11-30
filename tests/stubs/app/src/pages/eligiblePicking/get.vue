<template>
  <ul>
    <li v-for="(item, index) in itemsRef" :ref="elementsApi.getRef(index)">
      {{ item }}
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref, onMounted, shallowRef } from 'vue'
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

const abilities = [
  ...new Array(2).fill('disabled'),
  ...new Array(6).fill('enabled'),
  ...new Array(2).fill('disabled')
]
const ability = ({ index }) => abilities[index];


(window as unknown as WithGlobals).testState = {
  pickable,
  elementsApi,
  ability,
  eligiblePicking: createEligiblePicking({
    pickable,
    ability,
    elementsApi,
  }),
}

</script>
