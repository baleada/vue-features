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
import { usePickable } from '@baleada/vue-composition';
import { createReorder } from '@baleada/logic';
import { useListApi } from '../../../../../../src/extracted/useListApi';
import { createEligibleInListPickApi } from '../../../../../../src/extracted/createEligibleInListPickApi';
import { items } from './items'

const itemsRef = ref(items);

const api = useListApi({
  identifies: true,
  defaultMeta: { ability: 'enabled' as 'enabled' | 'disabled' }
});

const pickable = usePickable<HTMLElement>([]);

onMounted(() => {
  watchEffect(() => pickable.array = api.list.value)
});

const abilities = ref(new Array(10).fill('disabled'))

window.testState = {
  pickable,
  list: api,
  abilities,
  eligiblePickApi: createEligibleInListPickApi({
    pickable,
    api,
  }),
  reorder: () => itemsRef.value = createReorder<number>(0, 9)(itemsRef.value),
  remove: () => itemsRef.value = itemsRef.value.slice(0, 5),
  removeAndReorder: () => itemsRef.value = createReorder<number>(0, 9)(itemsRef.value).slice(0, 5),
}

</script>
