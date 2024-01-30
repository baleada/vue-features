<template>
  <div :ref="dialog.root.ref()"></div>
</template>

<script setup lang="tsx">
import { useDialog } from '../../../../../../src/interfaces/useDialog'
import { getOptions } from '../../getOptions'

const dialog = useDialog(getOptions())

window.testState = { dialog }
</script>
