<template>
  <ul>
    <li
      v-for="(item, index) in itemsRef"
      :ref="api.getRef(index, { ability: abilities[index] })"
      :key="item"
    >
      {{ item }}
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue'
import { useNavigateable } from '@baleada/vue-composition';
import { createReorder } from '@baleada/logic';
import { useListApi } from '../../../../../../src/extracted/useListApi';
import { createEligibleInListNavigateApi } from '../../../../../../src/extracted/createEligibleInListNavigateApi';
import { items } from './items'

const itemsRef = ref(items);

const api = useListApi({
  identifies: true,
  defaultMeta: { ability: 'enabled' as 'enabled' | 'disabled' }
});

const navigateable = useNavigateable<HTMLElement>([]);

onMounted(() => {
  watchEffect(() => navigateable.array = api.list.value)
});

const abilities = ref(new Array(10).fill('disabled'))

window.testState = {
  navigateable,
  list: api,
  abilities,
  eligibleNavigateApi: createEligibleInListNavigateApi({
    disabledElementsAreEligibleLocations: false,
    navigateable,
    loops: false,
    api,
  }),
  reorder: () => itemsRef.value = createReorder<number>(0, 9)(itemsRef.value),
  remove: () => itemsRef.value = itemsRef.value.slice(0, 5),
  removeAndReorder: () => itemsRef.value = createReorder<number>(0, 9)(itemsRef.value).slice(0, 5),
}

</script>
