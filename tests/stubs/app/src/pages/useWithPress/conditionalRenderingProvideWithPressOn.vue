<template>
  <ConditionalRenderingProvideWithPressOnChild />
</template>

<script setup lang="ts">
import ConditionalRenderingProvideWithPressOnChild from './ConditionalRenderingProvideWithPressOnChild.vue'
import { provideWithPressOn } from '../../../../../../src/extracted/provideWithPressOn'

provideWithPressOn()
</script>
