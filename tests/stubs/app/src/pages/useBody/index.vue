<template>
  <span></span>
</template>

<script setup lang="ts">
import { useBody } from '../../../../../../src/extracted/useBody'

window.testState = { body: useBody() }
</script>
