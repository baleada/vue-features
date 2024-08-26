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
import { useWithPress } from '../../../../../../src/extensions/useWithPress'

const element1 = ref(null)
const element2 = ref(null)
const count = ref(0)

const one = useWithPress(element1)
const two = useWithPress(element2)

const renderTwo = ref(false)

watch(
  two.firstPress,
  () => {
    count.value++
  }
)

watch(
  one.release,
  () => {
    console.log((one.release.value.sequence.at(-1).target as HTMLButtonElement).textContent)
    renderTwo.value = !renderTwo.value
  }
)

watch(
  two.release,
  () => {
    console.log((two.release.value.sequence.at(-1).target as HTMLButtonElement).textContent)
  }
)

window.testState = {
  one: { element: element1 },
  two: { element: element2, count }
}
</script>
