<template>
  <ul>
    <li v-for="(item, index) in itemsRef" :ref="elementsApi.getRef(index)">
      {{ item }}
    </li>
  </ul>
</template>

<script setup lang="ts">
import { onMounted, shallowRef } from 'vue'
import { useNavigateable } from '@baleada/vue-composition';
import { useElementApi } from '../../../../../../src/extracted';
import { createToPreviousPossible } from '../../../../../../src/extracted/createEnabledNavigation';
import { WithGlobals } from '../../../../../fixtures/types';
import { items } from './items'

const itemsRef = shallowRef(items);

const elementsApi = useElementApi({ multiple: true, identified: true });

const withAbility = useNavigateable<HTMLElement>([]);

onMounted(() => {
  withAbility.value.array = elementsApi.elements.value
});


(window as unknown as WithGlobals).testState = {
  withAbility,
  elementsApi,
  toPreviousPossible: createToPreviousPossible({
    elementsApi,
    withAbility,
    loops: false,
  }),
  toPreviousPossible_loops: createToPreviousPossible({
    elementsApi,
    withAbility,
    loops: true,
  })
}

</script>
