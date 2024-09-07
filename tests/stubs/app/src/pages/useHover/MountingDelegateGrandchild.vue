<template>
  <button ref="element">
    Grandchild
  </button>
</template>

<script setup lang="ts">
import { watch, ref } from 'vue'
import { useHover } from '../../../../../../src/extensions/useHover'

const element = ref()
const count = ref(0)
const hover = useHover(element)

watch(
  hover.firstDescriptor,
  () => {
    count.value++
  }
)

window.testState.grandchild = { element, count }
</script>
