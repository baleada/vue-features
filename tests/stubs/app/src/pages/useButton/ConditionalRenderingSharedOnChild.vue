<template>
  <button :ref="one.root.getRef()">
    One
  </button>
  <button v-if="renderTwo" :ref="two.root.getRef()">
    Two
  </button>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useButton } from '../../../../../../src/interfaces/useButton'

const one = useButton()
const two = useButton()

const renderTwo = ref(false)

watch(
  one.event,
  () => {
    console.log((one.event.value.target as HTMLButtonElement).textContent)
    renderTwo.value = !renderTwo.value
  }
)

watch(
  two.event,
  () => {
    console.log((two.event.value.target as HTMLButtonElement).textContent)
  }
)
</script>
