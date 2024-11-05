<template>
  <div class="relative">
    <Siblings id="exiting" />
  </div>
</template>

<script setup lang="tsx">
import Siblings from './Siblings.vue'
import { delegatePress } from '../../../../../../src/extracted/delegatePress'

delegatePress()
</script>
