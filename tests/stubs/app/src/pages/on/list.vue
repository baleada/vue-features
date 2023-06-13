<template>
  <section
    v-for="num in nums"
    :ref="api.getRef(num)"
  >{{ num }}</section>
  <button @click="() => (childIsMounted = !childIsMounted)">button</button>
  <ChildList
    v-if="childIsMounted"
    :elements="api.elements.value"
    :setIndex="value => (index = value)"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useElementApi } from '../../../../../../src/extracted/useElementApi'
import type { WithGlobals } from '../../../../../fixtures/types';
import ChildList from './ChildList.vue'

const nums = ref([0, 1, 2])
const api = useElementApi({ kind: 'list' }),
      index = ref(0),
      childIsMounted = ref(false)

window.testState =  { childIsMounted, index }
</script>
