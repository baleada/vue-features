<template>
  <ul>
    <li v-for="(item, index) in itemsRef" :ref="list.getRef(index)">
      {{ item }}
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref, onMounted, shallowRef } from 'vue'
import { usePickable } from '@baleada/vue-composition';
import { useElementApi } from '../../../../../../src/extracted';
import { createEligibleInListPicking } from '../../../../../../src/extracted/createEligibleInListPicking';
import { WithGlobals } from '../../../../../fixtures/types';
import { items } from './items'

const itemsRef = shallowRef(items);

const list = useElementApi({ kind: 'list', identified: true });

const pickable = usePickable<HTMLElement>([]);

onMounted(() => {
  pickable.value.array = list.elements.value
});

const abilities = [
  ...new Array(2).fill('disabled'),
  ...new Array(6).fill('enabled'),
  ...new Array(2).fill('disabled')
]
const ability = index => abilities[index]


window.testState = {
  pickable,
  list,
  ability,
  eligiblePicking: createEligibleInListPicking({
    pickable,
    ability,
    list,
  }),
}

</script>
