<template>
  <span ref="element"></span>
</template>

<script setup lang="tsx">
import { ref } from 'vue'
import { popupController } from '../../../../../../src/affordances/popupController'
import  { getOptions } from '../../getOptions'

const element = ref()
popupController(element, getOptions())

window.testState = { element }
</script>
