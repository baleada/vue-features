<template>
  <div class="relative">
    <Popup />
  </div>
</template>

<script setup lang="tsx">
import Popup from './Popup.vue'
import { delegateHover } from '../../../../../../src/extracted/delegateHover'

delegateHover()
</script>
