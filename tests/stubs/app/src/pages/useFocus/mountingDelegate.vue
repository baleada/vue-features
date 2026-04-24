<template>
  <MountingDelegateChild />
</template>

<script setup lang="ts">
import MountingDelegateChild from './MountingDelegateChild.vue'
import { delegateFocus } from '../../../../../../src/extracted/delegateFocus'

delegateFocus()

window.testState = {}
</script>
