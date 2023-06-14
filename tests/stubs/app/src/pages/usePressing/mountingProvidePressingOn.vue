<template>
  <MountingProvidePressingOnChild />
</template>

<script setup lang="ts">
import MountingProvidePressingOnChild from './MountingProvidePressingOnChild.vue'
import { providePressingOn } from '../../../../../../src/extracted/providePressingOn'

providePressingOn()
</script>
