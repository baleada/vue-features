<template>
  <MountingDelegateChild />
</template>

<script setup lang="ts">
import MountingDelegateChild from './MountingDelegateChild.vue'
import { delegateHover } from '../../../../../../src/extracted/delegateHover'

delegateHover()

window.testState = {}
</script>
