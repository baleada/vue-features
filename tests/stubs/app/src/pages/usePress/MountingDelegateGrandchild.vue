<template>
  <button ref="element">
    Grandchild
  </button>
</template>

<script setup lang="ts">
import { watch, ref } from 'vue'
import { usePress } from '../../../../../../src/extensions/usePress'

const element = ref()
const count = ref(0)
const press = usePress(element)

watch(
  press.firstDescriptor,
  () => {
    count.value++
  }
)

window.testState.grandchild = { element, count }
</script>
