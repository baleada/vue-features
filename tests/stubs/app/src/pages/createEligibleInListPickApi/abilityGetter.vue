<template>
  <ul>
    <li
      v-for="(item, index) in itemsRef"
      :ref="api.getRef(index, { ability: abilities[index] })"
    >
      {{ item }}
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref, onMounted, shallowRef } from 'vue'
import { usePickable } from '@baleada/vue-composition';
import { useListApi } from '../../../../../../src/extracted/useListApi';
import { createEligibleInListPickApi } from '../../../../../../src/extracted/createEligibleInListPickApi';
import { items } from './items'

const itemsRef = shallowRef(items);

const api = useListApi({
  identifies: true,
  defaultMeta: { ability: 'enabled' as 'enabled' | 'disabled' }
});

const pickable = usePickable<HTMLElement>([]);

onMounted(() => {
  pickable.array = api.list.value
});

const abilities = [
  ...new Array(2).fill('disabled'),
  ...new Array(6).fill('enabled'),
  ...new Array(2).fill('disabled')
]

window.testState = {
  pickable,
  list: api,
  eligiblePickApi: createEligibleInListPickApi({
    pickable,
    api,
  }),
}

</script>
