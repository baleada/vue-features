<template>
  <div>
    <span v-if="!withRender.is.removed()" ref="el"></span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useWithRender } from '../../../../../../src/extensions/useWithRender'

const el = ref<HTMLSpanElement>(null)
const withRender = useWithRender(el)

window.testState = { withRender }
</script>
