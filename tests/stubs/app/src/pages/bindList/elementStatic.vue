<template>
  <span :ref="api.getRef()" class="stub">stub</span>
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

window.testState =  {}
</script>
