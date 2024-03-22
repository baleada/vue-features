<template>
  <button ref="element">
    Grandchild
  </button>
</template>

<script setup lang="ts">
import { watch, ref } from 'vue'
import { useWithPress } from '../../../../../../src/extensions/useWithPress'

const element = ref()
const pressing = useWithPress(element)

watch(
  pressing.release,
  () => {
    console.log((pressing.release.value.sequence.at(-1).target as HTMLButtonElement).textContent)
  }
)
</script>
