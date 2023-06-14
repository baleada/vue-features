<template>
  <ul>
    <li v-for="(item, index) in itemsRef" :ref="list.getRef(index)">
      {{ item }}
    </li>
  </ul>
</template>

<script setup lang="ts">
import { shallowRef } from 'vue'
import { useElementApi } from '../../../../../../src/extracted';
import { createToPreviousEligible } from '../../../../../../src/extracted/createToEligibleInList';
import { items } from './items'

const itemsRef = shallowRef(items);

const list = useElementApi({ kind: 'list', identified: true })

window.testState = {
  list,
  toPreviousEligible: createToPreviousEligible({
    list,
    loops: false,
  }),
  toPreviousEligible_loops: createToPreviousEligible({
    list,
    loops: true,
  })
}

</script>
