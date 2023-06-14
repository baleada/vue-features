<template>
  <PerfChild />
</template>

<script setup lang="ts">
import PerfChild from './PerfProvidePressingOnChild.vue'
import { providePressingOn } from '../../../../../../src/extracted/providePressingOn'
providePressingOn()
</script>
