<template>
  <button ref="element">
    Grandchild
  </button>
</template>

<script setup lang="ts">
import { watch, ref } from 'vue'
import { useWithPress } from '../../../../../../src/extensions/useWithPress'

const element = ref()
const withPress = useWithPress(element)

watch(
  withPress.release,
  () => {
    console.log((withPress.release.value.sequence.at(-1).target as HTMLButtonElement).textContent)
  }
)
</script>
