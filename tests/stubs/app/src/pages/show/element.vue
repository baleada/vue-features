<template>
  <span :ref="api.getRef()">stub</span>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { WithGlobals } from '../../../../../fixtures/types'
import { useElementApi } from '../../../../../../src/extracted/useElementApi'
import { show } from '../../../../../../src/affordances/show'

const api = useElementApi()
const condition = ref(true)

show(
  api.element,
  condition,
)

;(window as unknown as WithGlobals).testState =  {
  api,
  condition,
}
</script>
