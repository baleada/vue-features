<template>
  <button ref="element1">
    One
  </button>
  <button v-if="renderTwo" ref="element2">
    Two
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useFocus } from '../../../../../../src/extensions/useFocus'

const element1 = ref(null)
const element2 = ref(null)

const one = useFocus(element1)
const two = useFocus(element2)

const renderTwo = ref(false)

window.testState = {
  one: { element: element1, focus: one },
  two: { element: element2, focus: two },
  renderTwo,
}
</script>
