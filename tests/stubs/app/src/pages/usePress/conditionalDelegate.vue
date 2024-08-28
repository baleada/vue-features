<template>
  <ConditionalConditionalDelegateChild />
</template>

<script setup lang="ts">
import ConditionalConditionalDelegateChild from './ConditionalDelegateChild.vue'
import { delegatePress } from '../../../../../../src/extracted/delegatePress'

delegatePress()
</script>
