<template>
  <span :ref="api.ref()">stub</span>
</template>

<script setup lang="ts">
import { useElementApi } from '../../../../../../src/extracted/useElementApi'
import { bindAttributeOrProperty } from '../../../../../../src/extracted/bindAttributeOrProperty'

const api = useElementApi()

bindAttributeOrProperty(
  api.element,
  'dataLabel',
  'stub',
  [],
)

window.testState =  {}
</script>
