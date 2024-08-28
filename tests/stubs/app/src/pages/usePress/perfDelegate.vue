<template>
  <PerfChild />
</template>

<script setup lang="ts">
import PerfChild from './PerfDelegateChild.vue'
import { delegatePress } from '../../../../../../src/extracted/delegatePress'
delegatePress()
</script>
