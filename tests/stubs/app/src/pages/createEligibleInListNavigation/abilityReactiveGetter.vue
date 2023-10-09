<template>
  <ul>
    <li
      v-for="(item, index) in itemsRef"
      :ref="list.getRef(index, { ability: abilities[index] })"
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
import { useElementApi } from '../../../../../../src/extracted';
import { createEligibleInListNavigation } from '../../../../../../src/extracted/createEligibleInListNavigation';
import { items } from './items'

const itemsRef = ref(items);

const list = useElementApi({
  kind: 'list',
  identified: true,
  defaultMeta: { ability: 'enabled' as 'enabled' | 'disabled' }
});

const navigateable = useNavigateable<HTMLElement>([]);

onMounted(() => {
  watchEffect(() => navigateable.array = list.elements.value)
});

const abilities = ref(new Array(10).fill('disabled'))

window.testState = {
  navigateable,
  list,
  abilities,
  eligibleNavigation: createEligibleInListNavigation({
    disabledElementsAreEligibleLocations: false,
    navigateable,
    loops: false,
    list,
  }),
  reorder: () => itemsRef.value = createReorder<number>(0, 9)(itemsRef.value),
  remove: () => itemsRef.value = itemsRef.value.slice(0, 5),
  removeAndReorder: () => itemsRef.value = createReorder<number>(0, 9)(itemsRef.value).slice(0, 5),
}

</script>
