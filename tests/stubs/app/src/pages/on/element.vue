<template>
  <section :ref="api.getRef()">{{ count }}</section>
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
import type { WithGlobals } from '../../../../../fixtures/types';
import ChildElement from './ChildElement.vue'

const api = useElementApi(),
      count = ref(0),
      childIsMounted = ref(false)

;(window as unknown as WithGlobals).testState =  { childIsMounted, count }
</script>
