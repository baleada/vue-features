<template>
  <ConditionalRenderingSharedOnChild />
</template>

<script setup lang="ts">
import ConditionalRenderingSharedOnChild from './ConditionalRenderingSharedOnChild.vue'
import { shareButtonOn } from '../../../../../../src/extracted/shareButtonOn'

shareButtonOn()
</script>
