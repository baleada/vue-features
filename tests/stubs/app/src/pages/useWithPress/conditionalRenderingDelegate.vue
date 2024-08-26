<template>
  <ConditionalRenderingDelegateChild />
</template>

<script setup lang="ts">
import ConditionalRenderingDelegateChild from './ConditionalRenderingDelegateChild.vue'
import { delegatePress } from '../../../../../../src/extracted/delegatePress'

delegatePress()
</script>
