<template>
  <div class="relative">
    <Removing />
  </div>
</template>

<script setup lang="tsx">
import Removing from './Removing.vue'
import { delegatePress } from '../../../../../../src/extracted/delegatePress'

delegatePress()
</script>
