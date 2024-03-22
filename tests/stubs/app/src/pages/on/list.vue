<template>
  <section
    v-for="num in nums"
    :ref="api.ref(num)"
  >{{ num }}</section>
  <button @click="() => (childIsMounted = !childIsMounted)">button</button>
  <ChildList
    v-if="childIsMounted"
    :elements="api.list.value"
    :setIndex="value => (index = value)"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useListApi } from '../../../../../../src/extracted/useListApi'
import ChildList from './ChildList.vue'

const nums = ref([0, 1, 2])
const api = useListApi(),
      index = ref(0),
      childIsMounted = ref(false)

window.testState =  { childIsMounted, index }
</script>
