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
import { createPossibleNavigation } from '../../../../../../src/extracted/createPossibleNavigation';
import { WithGlobals } from '../../../../../fixtures/types';
import { items } from './items'

const itemsRef = shallowRef(items);

const elementsApi = useElementApi({ multiple: true, identified: true });

const navigateable = useNavigateable<HTMLElement>([]);

onMounted(() => {
  navigateable.value.array = elementsApi.elements.value
});

const abilities = ref(new Array(10).fill('disabled'))
const ability = ({ index }) => abilities.value[index];


(window as unknown as WithGlobals).testState = {
  navigateable,
  elementsApi,
  ability,
  abilities,
  possibleNavigation: createPossibleNavigation({
    disabledElementsArePossibleLocations: false,
    navigateable,
    loops: false,
    ability: {
      get: ability,
      watchSources: abilities,
    },
    elementsApi,
    getAbility: index => ability({ index }),
  }),
}

</script>
