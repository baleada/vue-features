<template>
  <ul>
    <li v-for="(item, index) in itemsRef" :ref="list.getRef(index)">
      {{ item }}
    </li>
  </ul>
</template>

<script setup lang="ts">
import { shallowRef } from 'vue'
import { useListApi } from '../../../../../../src/extracted/useListApi';
import { createToPreviousEligible } from '../../../../../../src/extracted/createToEligibleInList';
import { items } from './items'

const itemsRef = shallowRef(items);

const list = useListApi({ identifies: true })

window.testState = {
  list,
  toPreviousEligible: createToPreviousEligible({
    api: list,
    loops: false,
  }),
  toPreviousEligible_loops: createToPreviousEligible({
    api: list,
    loops: true,
  })
}

</script>
