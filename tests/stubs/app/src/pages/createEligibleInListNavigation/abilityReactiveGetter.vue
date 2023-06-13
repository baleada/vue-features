<template>
  <ul>
    <li v-for="(item, index) in itemsRef" :ref="list.getRef(index)" :key="item">
      {{ item }}
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue'
import { useNavigateable } from '@baleada/vue-composition';
import { createReorder } from '@baleada/logic';
import { useElementApi } from '../../../../../../src/extracted';
import { createEligibleInListNavigation } from '../../../../../../src/extracted/createEligibleInListNavigation';
import { WithGlobals } from '../../../../../fixtures/types';
import { items } from './items'

const itemsRef = ref(items);

const list = useElementApi({ kind: 'list', identified: true });

const navigateable = useNavigateable<HTMLElement>([]);

onMounted(() => {
  watchEffect(() => navigateable.value.array = list.elements.value)
});

const abilities = ref(new Array(10).fill('disabled'))
const ability = index => abilities.value[index]


window.testState = {
  navigateable,
  list,
  ability,
  abilities,
  eligibleNavigation: createEligibleInListNavigation({
    disabledElementsAreEligibleLocations: false,
    navigateable,
    loops: false,
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
