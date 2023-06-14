<template>
  <ul>
    <li v-for="(item, index) in itemsRef" :ref="list.getRef(index)">
      {{ item }}
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref, onMounted, shallowRef } from 'vue'
import { useNavigateable } from '@baleada/vue-composition';
import { useElementApi } from '../../../../../../src/extracted';
import { createEligibleInListNavigation } from '../../../../../../src/extracted/createEligibleInListNavigation';
import { items } from './items'

const itemsRef = shallowRef(items);

const list = useElementApi({ kind: 'list', identified: true });

const navigateable = useNavigateable<HTMLElement>([]);

onMounted(() => {
  navigateable.value.array = list.elements.value
});

const abilities = [
  ...new Array(2).fill('disabled'),
  ...new Array(6).fill('enabled'),
  ...new Array(2).fill('disabled')
]
const ability = index => abilities[index]


window.testState = {
  navigateable,
  list,
  ability,
  eligibleNavigation: createEligibleInListNavigation({
    disabledElementsAreEligibleLocations: false,
    navigateable,
    loops: false,
    ability,
    list,
  }),
}

</script>
