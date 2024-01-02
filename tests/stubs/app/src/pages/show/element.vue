<template>
  <span :ref="api.ref()">stub</span>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useElementApi } from '../../../../../../src/extracted/useElementApi'
import { show } from '../../../../../../src/affordances/show'

const api = useElementApi()
const condition = ref(true)

show(
  api.element,
  condition,
)

window.testState =  {
  api,
  condition,
}
</script>
