<template>
  <span :ref="api.getRef()" class="stub">stub</span>
</template>

<script setup lang="ts">
import type { WithGlobals } from '../../../../../fixtures/types'
import { useElementApi } from '../../../../../../src/extracted/useElementApi'
import { bindList } from '../../../../../../src/extracted/bindList'

const api = useElementApi()

bindList(
  api.element,
  'class',
  'red',
  [],
)

;(window as unknown as WithGlobals).testState =  {}
</script>
