<template>
  <PerfChild />
</template>

<script setup lang="ts">
import PerfChild from './PerfProvideWithPressOnChild.vue'
import { provideWithPressOn } from '../../../../../../src/extracted/provideWithPressOn'
provideWithPressOn()
</script>
