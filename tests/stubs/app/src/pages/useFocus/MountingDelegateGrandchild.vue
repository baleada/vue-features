<template>
  <button ref="element">
    Grandchild
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useFocus } from '../../../../../../src/extensions/useFocus'

const element = ref()
const focus = useFocus(element)

window.testState.grandchild = { element, focus }
</script>
