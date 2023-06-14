<template>
  <ConditionalRenderingProvidePressingOnChild />
</template>

<script setup lang="ts">
import ConditionalRenderingProvidePressingOnChild from './ConditionalRenderingProvidePressingOnChild.vue'
import { providePressingOn } from '../../../../../../src/extracted/providePressingOn'

providePressingOn()
</script>
