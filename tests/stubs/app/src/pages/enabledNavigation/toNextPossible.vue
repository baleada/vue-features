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
import { createToNextPossible } from '../../../../../../src/extracted/createEnabledNavigation';
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
  toNextPossible: createToNextPossible({
    elementsApi,
    withAbility,
    loops: false,
  }),
  toNextPossible_loops: createToNextPossible({
    elementsApi,
    withAbility,
    loops: true,
  })
}

</script>
