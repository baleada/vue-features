<template>
  <span :ref="api.getRef()" class="stub">stub</span>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { WithGlobals } from '../../../../../fixtures/types'
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

;(window as unknown as WithGlobals).testState =  { color }
</script>
