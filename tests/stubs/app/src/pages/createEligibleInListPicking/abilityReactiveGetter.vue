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
import { usePickable } from '@baleada/vue-composition';
import { createReorder } from '@baleada/logic';
import { useElementApi } from '../../../../../../src/extracted';
import { createEligibleInListPicking } from '../../../../../../src/extracted/createEligibleInListPicking';
import { items } from './items'

const itemsRef = ref(items);

const list = useElementApi({
  kind: 'list',
  identified: true,
  defaultMeta: { ability: 'enabled' as 'enabled' | 'disabled' }
});

const pickable = usePickable<HTMLElement>([]);

onMounted(() => {
  watchEffect(() => pickable.value.array = list.elements.value)
});

const abilities = ref(new Array(10).fill('disabled'))

window.testState = {
  pickable,
  list,
  abilities,
  eligiblePicking: createEligibleInListPicking({
    pickable,
    list,
  }),
  reorder: () => itemsRef.value = createReorder<number>(0, 9)(itemsRef.value),
  remove: () => itemsRef.value = itemsRef.value.slice(0, 5),
  removeAndReorder: () => itemsRef.value = createReorder<number>(0, 9)(itemsRef.value).slice(0, 5),
}

</script>
