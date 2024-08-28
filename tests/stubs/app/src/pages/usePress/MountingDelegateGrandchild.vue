<template>
  <button ref="element">
    Grandchild
  </button>
</template>

<script setup lang="ts">
import { watch, ref } from 'vue'
import { usePress } from '../../../../../../src/extensions/usePress'

const element = ref()
const count = ref(0)
const pressable = usePress(element)

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
  }
)

window.testState.grandchild = { element, count }
</script>
