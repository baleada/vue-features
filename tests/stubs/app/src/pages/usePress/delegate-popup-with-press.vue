<template>
  <div class="relative">
    <PopupWithPress />
  </div>
</template>

<script setup lang="tsx">
import PopupWithPress from './PopupWithPress.vue'
import { delegatePress } from '../../../../../../src/extracted/delegatePress'

delegatePress()
</script>
