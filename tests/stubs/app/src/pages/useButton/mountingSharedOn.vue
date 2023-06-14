<template>
  <MountingSharedOnChild />
</template>

<script setup lang="ts">
import MountingSharedOnChild from './MountingSharedOnChild.vue'
import { shareButtonOn } from '../../../../../../src/extracted/shareButtonOn'

shareButtonOn()
</script>
