<template>
  <button ref="element">
    Child
  </button>
  <MountingDelegateGrandchildVue v-if="mountGrandchild" />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { usePress } from '../../../../../../src/extensions/usePress'
import MountingDelegateGrandchildVue from './MountingDelegateGrandchild.vue';

const element = ref()
const count = ref(0)
const pressable = usePress(element)

const mountGrandchild = ref(false)

watch(
  pressable.firstDescriptor,
  () => {
    count.value++
  }
)

watch(
  pressable.releaseDescriptor,
  () => {
    console.log((pressable.releaseDescriptor.value.sequence.at(-1).target as HTMLButtonElement).textContent)
    mountGrandchild.value = !mountGrandchild.value
  }
)

window.testState.child = { element, count }
</script>
