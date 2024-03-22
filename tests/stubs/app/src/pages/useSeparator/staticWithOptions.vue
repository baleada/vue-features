<template>
  <div class="flex gap-4">
    <div>baleada</div>
    <div :ref="separator.root.ref()"></div>
    <div>vue features</div>
  </div>
</template>

<script setup lang="ts">
import { useSeparator } from '../../../../../../src/interfaces/useSeparator'

const separator = useSeparator({
  orientation: 'vertical',
})

window.testState = { separator }
</script>
