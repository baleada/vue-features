<template>
  <MountingDelegateChild />
</template>

<script setup lang="ts">
import MountingDelegateChild from './MountingDelegateChild.vue'
import { delegatePress } from '../../../../../../src/extracted/delegatePress'

delegatePress()

window.testState = {}
</script>
