<template>
  <button ref="el">with press</button>
</template>

<script setup lang="tsx">
import { ref } from 'vue'
import { useWithPress } from '../../../../../../src/extensions/useWithPress'
import { getOptions } from '../../getOptions';

const el = ref()

window.testState = { withPress: useWithPress(el, getOptions()) }
</script>
