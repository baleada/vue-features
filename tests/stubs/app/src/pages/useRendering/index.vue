<template>
  <div>
    <span v-if="!rendering.is.removed()" ref="el"></span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRendering } from '../../../../../../src/extensions/useRendering'

const el = ref<HTMLSpanElement>(null)
const rendering = useRendering(el)

window.testState = { rendering }
</script>
