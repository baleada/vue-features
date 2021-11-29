<template>
  <ul>
    <li v-for="(item, index) in itemsRef" :ref="elementsApi.getRef(index)">
      {{ item }}
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref, onMounted, shallowRef } from 'vue'
import { useNavigateable } from '@baleada/vue-composition';
import { useElementApi } from '../../../../../../src/extracted';
import { createEligibleNavigation } from '../../../../../../src/extracted/createEligibleNavigation';
import { WithGlobals } from '../../../../../fixtures/types';
import { items } from './items'

const itemsRef = shallowRef(items);

const elementsApi = useElementApi({ multiple: true, identified: true });

const navigateable = useNavigateable<HTMLElement>([]);

onMounted(() => {
  navigateable.value.array = elementsApi.elements.value
});

const ability = ref('disabled');


(window as unknown as WithGlobals).testState = {
  navigateable,
  elementsApi,
  ability,
  possibleNavigation: createEligibleNavigation({
    disabledElementsAreEligibleLocations: false,
    navigateable,
    loops: false,
    ability,
    elementsApi,
    getAbility: () => ability.value,
  }),
}

</script>
