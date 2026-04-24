<template>
  <ConditionalDelegateChild />
</template>

<script setup lang="ts">
import ConditionalDelegateChild from './ConditionalDelegateChild.vue'
import { delegateFocus } from '../../../../../../src/extracted/delegateFocus'

delegateFocus()
</script>
