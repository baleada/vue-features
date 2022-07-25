<template>
  <PerfChild />
</template>

<script setup lang="ts">
import PerfChild from './PerfSharedOnChild.vue'
import { shareButtonOn } from '../../../../../../src/extracted/shareButtonOn'
shareButtonOn()
</script>
