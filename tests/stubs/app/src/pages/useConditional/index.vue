<template>
  <div>
    <span v-if="!conditional.is.removed()" ref="el"></span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useConditional } from '../../../../../../src/extensions/useConditional'

const el = ref<HTMLSpanElement>(null)
const conditional = useConditional(el)

window.testState = { conditional }
</script>
