<template>
  <div class="relative">
    <UnpressableOverlay />
  </div>
</template>

<script setup lang="tsx">
import UnpressableOverlay from './UnpressableOverlay.vue'
import { delegatePress } from '../../../../../../src/extracted/delegatePress'

delegatePress()
</script>
