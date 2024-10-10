<template>
  <span :ref="api.ref()" class="stub">stub</span>
</template>

<script setup lang="ts">
import { useElementApi } from '../../../../../../src/extracted/useElementApi'
import { bindList } from '../../../../../../src/extracted/bindList'

const api = useElementApi()

bindList(
  api.element,
  'class',
  'red',
  [],
)

bindList(
  api.element,
  'ariaDescribedbys',
  'red',
  [],
)

bindList(
  api.element,
  'ariaDescribedbys',
  'red',
  [],
)

bindList(
  api.element,
  'ariaDescribedbys',
  'blue',
  [],
)

bindList(
  api.element,
  'ariaDescribedbys',
  'blue blue',
  [],
)

window.testState =  {}
</script>
