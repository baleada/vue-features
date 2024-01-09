<template>
  <ul>
    <li v-for="(item, index) in itemsRef" :ref="list.ref(index)">
      {{ item }}
    </li>
  </ul>
</template>

<script setup lang="ts">
import { shallowRef } from 'vue'
import { useListApi } from '../../../../../../src/extracted/useListApi';
import { createToNextEligible } from '../../../../../../src/extracted/createToEligibleInList';
import { items } from './items'

const itemsRef = shallowRef(items);

const list = useListApi({ identifies: true })


window.testState = {
  list,
  toNextEligible: createToNextEligible({
    api: list,
  }),
}

</script>
