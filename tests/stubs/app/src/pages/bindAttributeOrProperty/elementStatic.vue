<template>
  <span :ref="api.getRef()">stub</span>
</template>

<script setup lang="ts">
import { useElementApi } from '../../../../../../src/extracted/useElementApi'
import { bindAttributeOrProperty } from '../../../../../../src/extracted/bindAttributeOrProperty'

const api = useElementApi()

bindAttributeOrProperty(
  api.element,
  'id',
  'stub',
  [],
)

window.testState =  {}
</script>
