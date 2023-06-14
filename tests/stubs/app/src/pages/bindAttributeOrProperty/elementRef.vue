<template>
  <span :ref="api.getRef()">stub</span>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
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

window.testState =  { count }
</script>
