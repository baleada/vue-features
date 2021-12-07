<template>
  <ul>
    <li v-for="(item, index) in itemsRef" :ref="elementsApi.getRef(index)" :key="item">
      {{ item }}
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue'
import { usePickable } from '@baleada/vue-composition';
import { createReorder } from '@baleada/logic';
import { useElementApi } from '../../../../../../src/extracted';
import { createEligiblePicking } from '../../../../../../src/extracted/createEligiblePicking';
import { WithGlobals } from '../../../../../fixtures/types';
import { items } from './items'

const itemsRef = ref(items);

const elementsApi = useElementApi({ multiple: true, identified: true });

const pickable = usePickable<HTMLElement>([]);

onMounted(() => {
  watchEffect(() => pickable.value.array = elementsApi.elements.value)
});

const abilities = ref(new Array(10).fill('disabled'))
const ability = ({ index }) => abilities.value[index];


(window as unknown as WithGlobals).testState = {
  pickable,
  elementsApi,
  ability,
  abilities,
  eligiblePicking: createEligiblePicking({
    pickable,
    ability: {
      get: ability,
      watchSource: abilities,
    },
    elementsApi,
  }),
  reorder: () => itemsRef.value = createReorder<number>({ from: 0, to: 9 })(itemsRef.value),
  remove: () => itemsRef.value = itemsRef.value.slice(0, 5),
  removeAndReorder: () => itemsRef.value = createReorder<number>({ from: 0, to: 9 })(itemsRef.value).slice(0, 5),
}

</script>
