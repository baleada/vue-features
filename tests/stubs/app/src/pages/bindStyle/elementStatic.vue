<template>
  <span :ref="api.ref" class="stub">stub</span>
</template>

<script setup lang="ts">
import type { WithGlobals } from '../../../../../fixtures/types'
import { useElementApi } from '../../../../../../src/extracted/useElementApi'
import { bindStyle } from '../../../../../../src/extracted/bindStyle'

const api = useElementApi()

bindStyle(
  api.element,
  'backgroundColor',
  'red',
  [],
)

;(window as unknown as WithGlobals).testState =  {}
</script>
