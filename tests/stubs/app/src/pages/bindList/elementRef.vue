<template>
  <span :ref="api.ref()" class="stub">stub</span>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useElementApi } from '../../../../../../src/extracted/useElementApi'
import { bindList } from '../../../../../../src/extracted/bindList'

const api = useElementApi(),
      color = ref('red')

bindList(
  api.element,
  'class',
  color,
  [],
)

window.testState =  { color }
</script>
