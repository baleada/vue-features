<template>
  <section :ref="api.ref()">{{ count }}</section>
  <button @click="() => (childIsMounted = !childIsMounted)">button</button>
  <ChildElement
    v-if="childIsMounted"
    :element="api.element.value"
    :count="count"
    :setCount="value => (count = value)"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useElementApi } from '../../../../../../src/extracted/useElementApi'
import ChildElement from './ChildElement.vue'

const api = useElementApi(),
      count = ref(0),
      childIsMounted = ref(false)

window.testState =  { childIsMounted, count }
</script>
