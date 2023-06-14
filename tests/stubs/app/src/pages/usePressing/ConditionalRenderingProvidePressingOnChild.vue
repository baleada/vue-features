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
import { usePressing } from '../../../../../../src/extensions/usePressing'

const element1 = ref(null)
const element2 = ref(null)

const one = usePressing(element1)
const two = usePressing(element2)

const renderTwo = ref(false)

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
</script>
