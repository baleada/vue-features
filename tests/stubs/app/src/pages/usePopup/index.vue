<template>
  <span></span>
</template>

<script setup lang="ts">
import { usePopup } from '../../../../../../src/extracted/usePopup'

window.testState = { popup: usePopup() }
</script>
