<template>
  <span :ref="api.ref()" class="stub">stub</span>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useElementApi } from '../../../../../../src/extracted/useElementApi'
import { bindStyle } from '../../../../../../src/extracted/bindStyle'

const api = useElementApi(),
      color = ref('red')

bindStyle(
  api.element,
  'backgroundColor',
  color,
  [],
)

window.testState =  { color }
</script>
