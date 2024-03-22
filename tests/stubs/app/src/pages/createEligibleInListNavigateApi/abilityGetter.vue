<template>
  <ul>
    <li
      v-for="(item, index) in itemsRef"
      :ref="api.ref(index, { ability: abilities[index] })"
    >
      {{ item }}
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref, onMounted, shallowRef } from 'vue'
import { useNavigateable } from '@baleada/vue-composition';
import { useListApi } from '../../../../../../src/extracted/useListApi';
import { createEligibleInListNavigateApi } from '../../../../../../src/extracted/createEligibleInListNavigateApi';
import { createToNextEligible, createToPreviousEligible } from '../../../../../../src/extracted/createToEligibleInList';
import { items } from './items'

const itemsRef = shallowRef(items);

const api = useListApi({
  identifies: true,
  defaultMeta: { ability: 'enabled' as 'enabled' | 'disabled' }
});

const navigateable = useNavigateable<HTMLElement>([]);

onMounted(() => {
  navigateable.array = api.list.value
});

const abilities = [
  ...new Array(2).fill('disabled'),
  ...new Array(6).fill('enabled'),
  ...new Array(2).fill('disabled')
]

window.testState = {
  navigateable,
  list: api,
  eligibleNavigateApi: createEligibleInListNavigateApi({
    disabledElementsAreEligibleLocations: false,
    navigateable,
    loops: false,
    api,
    toNextEligible: createToNextEligible({ api }),
    toPreviousEligible: createToPreviousEligible({ api }),
  }),
}

</script>
