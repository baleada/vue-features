<template>
  <button ref="element1">
    One
  </button>
  <button v-if="renderTwo" ref="element2">
    Two
  </button>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { usePress } from '../../../../../../src/extensions/usePress'

const element1 = ref(null)
const element2 = ref(null)
const count = ref(0)

const one = usePress(element1)
const two = usePress(element2)

const renderTwo = ref(false)

watch(
  two.firstDescriptor,
  () => {
    count.value++
  }
)

watch(
  one.releaseDescriptor,
  () => {
    console.log((one.releaseDescriptor.value.sequence.at(-1).target as HTMLButtonElement).textContent)
    renderTwo.value = !renderTwo.value
  }
)

watch(
  two.releaseDescriptor,
  () => {
    console.log((two.releaseDescriptor.value.sequence.at(-1).target as HTMLButtonElement).textContent)
  }
)

window.testState = {
  one: { element: element1 },
  two: { element: element2, count }
}
</script>
