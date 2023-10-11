<template>
  <input type="text" />
  <ul>
    <li v-for="(item, index) in itemsRef" :tabindex="index === navigateable.location ? '0' : '-1'" :ref="elementsApi.getRef(index)">
      {{ item }}
    </li>
  </ul>
</template>

<script setup lang="ts">
import { onMounted, shallowRef } from 'vue'
import { useNavigateable } from '@baleada/vue-composition';
import { useElementApi } from '../../../../../../src/extracted';
import { navigateAndPickOnHorizontal } from '../../../../../../src/extracted/useListState';
import { createEligibleNavigation } from '../../../../../../src/extracted/createEligibleNavigation';

const itemsRef = shallowRef(new Array(5).fill(0).map((_, index) => index));

const elementsApi = useElementApi({ multiple: true, identifies: true });

const navigateable = useNavigateable<HTMLElement>([]);

onMounted(() => {
  navigateable.array = elementsApi.elements.value
  navigateable.navigate(2)
});

const eligibleNavigation = createEligibleNavigation({
  disabledElementsAreEligibleLocations: false,
  navigateable,
  loops: false,
  ability: 'enabled',
  elementsApi,
})

navigateOnHorizontal({ elementsApi, eligibleNavigation })

window.testState = {
  navigateable,
}

</script>
