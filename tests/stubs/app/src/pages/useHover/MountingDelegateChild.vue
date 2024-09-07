<template>
  <button ref="element">
    Child
  </button>
  <MountingDelegateGrandchildVue v-if="mountGrandchild" />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useHover } from '../../../../../../src/extensions/useHover'
import MountingDelegateGrandchildVue from './MountingDelegateGrandchild.vue';

const element = ref()
const count = ref(0)
const hover = useHover(element)

const mountGrandchild = ref(false)

watch(
  hover.firstDescriptor,
  () => {
    count.value++
  }
)

window.testState.child = { element, count, mountGrandchild }
</script>
