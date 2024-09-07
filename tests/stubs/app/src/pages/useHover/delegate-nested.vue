<template>
  <div class="relative">
    <div class="absolute inset-0 translate-x-4 translate-y-4">
      <Nested id="top" />
    </div>
    <Nested id="bottom" />
  </div>
</template>

<script setup lang="tsx">
import Nested from './nested.vue'
import { delegateHover } from '../../../../../../src/extracted/delegateHover'

delegateHover()
</script>
