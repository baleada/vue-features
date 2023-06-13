<template>
  <ul>
    <li v-for="(item, index) in itemsRef" :ref="list.getRef(index)" :key="item">
      {{ item }}
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue'
import { usePickable } from '@baleada/vue-composition';
import { createReorder } from '@baleada/logic';
import { useElementApi } from '../../../../../../src/extracted';
import { createEligibleInListPicking } from '../../../../../../src/extracted/createEligibleInListPicking';
import { WithGlobals } from '../../../../../fixtures/types';
import { items } from './items'

const itemsRef = ref(items);

const list = useElementApi({ kind: 'list', identified: true });

const pickable = usePickable<HTMLElement>([]);

onMounted(() => {
  watchEffect(() => pickable.value.array = list.elements.value)
});

const abilities = ref(new Array(10).fill('disabled'))
const ability = index => abilities.value[index]


window.testState = {
  pickable,
  list,
  ability,
  abilities,
  eligiblePicking: createEligibleInListPicking({
    pickable,
    ability: {
      get: ability,
      watchSource: abilities,
    },
    list,
  }),
  reorder: () => itemsRef.value = createReorder<number>(0, 9)(itemsRef.value),
  remove: () => itemsRef.value = itemsRef.value.slice(0, 5),
  removeAndReorder: () => itemsRef.value = createReorder<number>(0, 9)(itemsRef.value).slice(0, 5),
}

</script>
