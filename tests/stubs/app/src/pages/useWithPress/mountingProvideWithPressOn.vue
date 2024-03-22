<template>
  <MountingProvideWithPressOnChild />
</template>

<script setup lang="ts">
import MountingProvideWithPressOnChild from './MountingProvideWithPressOnChild.vue'
import { provideWithPressOn } from '../../../../../../src/extracted/provideWithPressOn'

provideWithPressOn()
</script>
