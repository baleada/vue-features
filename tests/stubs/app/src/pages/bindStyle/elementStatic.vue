<template>
  <span :ref="api.getRef()" class="stub">stub</span>
</template>

<script setup lang="ts">
import { useElementApi } from '../../../../../../src/extracted/useElementApi'
import { bindStyle } from '../../../../../../src/extracted/bindStyle'

const api = useElementApi()

bindStyle(
  api.element,
  'backgroundColor',
  'red',
  [],
)

window.testState =  {}
</script>
