<template>
  <div>
    <span v-if="rendering.is.rendered()" ref="el"></span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useConditionalRendering } from '../../../../../../src/extensions/useConditionalRendering'

const el = ref<HTMLSpanElement>(null)
const rendering = useConditionalRendering(el)

window.testState = { rendering }
</script>
