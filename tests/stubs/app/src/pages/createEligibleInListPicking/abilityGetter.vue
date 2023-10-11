<template>
  <ul>
    <li
      v-for="(item, index) in itemsRef"
      :ref="list.getRef(index, { ability: abilities[index] })"
    >
      {{ item }}
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref, onMounted, shallowRef } from 'vue'
import { usePickable } from '@baleada/vue-composition';
import { useElementApi } from '../../../../../../src/extracted';
import { createEligibleInListPicking } from '../../../../../../src/extracted/createEligibleInListPicking';
import { items } from './items'

const itemsRef = shallowRef(items);

const list = useElementApi({
  kind: 'list',
  identifies: true,
  defaultMeta: { ability: 'enabled' as 'enabled' | 'disabled' }
});

const pickable = usePickable<HTMLElement>([]);

onMounted(() => {
  pickable.array = list.elements.value
});

const abilities = [
  ...new Array(2).fill('disabled'),
  ...new Array(6).fill('enabled'),
  ...new Array(2).fill('disabled')
]

window.testState = {
  pickable,
  list,
  eligiblePicking: createEligibleInListPicking({
    pickable,
    list,
  }),
}

</script>
