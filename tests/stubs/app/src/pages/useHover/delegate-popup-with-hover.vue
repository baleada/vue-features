<template>
  <div class="relative">
    <PopupWithHover />
  </div>
</template>

<script setup lang="tsx">
import PopupWithHover from './PopupWithHover.vue'
import { delegateHover } from '../../../../../../src/extracted/delegateHover'

delegateHover()
</script>
