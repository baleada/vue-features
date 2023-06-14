<template>
  <button ref="element">
    Grandchild
  </button>
</template>

<script setup lang="ts">
import { watch, ref } from 'vue'
import { usePressing } from '../../../../../../src/extensions/usePressing'

const element = ref()
const pressing = usePressing(element)

watch(
  pressing.release,
  () => {
    console.log((pressing.release.value.sequence.at(-1).target as HTMLButtonElement).textContent)
  }
)
</script>
