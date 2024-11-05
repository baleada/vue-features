<template>
  <div class="relative">
    <Popup />
  </div>
</template>

<script setup lang="tsx">
import Popup from './Popup.vue'
import { delegatePress } from '../../../../../../src/extracted/delegatePress'

delegatePress()
</script>
