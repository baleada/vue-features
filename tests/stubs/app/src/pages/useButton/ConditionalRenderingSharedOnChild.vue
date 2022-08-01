<template>
  <button :ref="one.root.ref">
    One
  </button>
  <button v-if="renderTwo" :ref="two.root.ref">
    Two
  </button>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useButton } from '../../../../../../src/interfaces/useButton'
import { WithGlobals } from '../../../../../fixtures/types';

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
