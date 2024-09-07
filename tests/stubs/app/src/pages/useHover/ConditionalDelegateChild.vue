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
import { useHover } from '../../../../../../src/extensions/useHover'

const element1 = ref(null)
const element2 = ref(null)
const count = ref(0)

const one = useHover(element1)
const two = useHover(element2)

const renderTwo = ref(false)

watch(
  two.firstDescriptor,
  () => {
    count.value++
  }
)

window.testState = {
  one: { element: element1 },
  two: { element: element2, count },
  renderTwo,
}
</script>
