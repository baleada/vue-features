<template>
  <button ref="el">with press</button>
</template>

<script setup lang="tsx">
import { ref } from 'vue'
import { usePress } from '../../../../../../src/extensions/usePress'
import { getOptions } from '../../getParam';

const el = ref()

window.testState = { press: usePress(el, getOptions()) }
</script>
