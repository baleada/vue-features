<template>
  <ConditionalConditionalDelegateChild />
</template>

<script setup lang="ts">
import ConditionalConditionalDelegateChild from './ConditionalDelegateChild.vue'
import { delegateHover } from '../../../../../../src/extracted/delegateHover'

delegateHover()
</script>
