<template>
  <span :ref="api.getRef()" class="stub">stub</span>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { WithGlobals } from '../../../../../fixtures/types'
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

;(window as unknown as WithGlobals).testState =  { color }
</script>
