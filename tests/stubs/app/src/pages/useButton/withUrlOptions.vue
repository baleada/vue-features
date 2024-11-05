<template>
  <span :ref="button.root.ref()">click me</span>
</template>

<script setup lang="ts">
import { useButton } from '../../../../../../src/interfaces/useButton'
import { getOptions } from '../../getParam'

const button = useButton(getOptions())

window.testState= { button }
</script>
