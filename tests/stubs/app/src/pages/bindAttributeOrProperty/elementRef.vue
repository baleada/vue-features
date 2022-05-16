<template>
  <span :ref="api.ref">stub</span>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { WithGlobals } from '../../../../../fixtures/types'
import { useElementApi } from '../../../../../../src/extracted/useElementApi'
import { bindAttributeOrProperty } from '../../../../../../src/extracted/bindAttributeOrProperty'

const api = useElementApi(),
      count = ref(0)

bindAttributeOrProperty(
  api.element,
  'id',
  computed(() => `stub-${count.value}`),
  [],
)

;(window as unknown as WithGlobals).testState =  { count }
</script>
