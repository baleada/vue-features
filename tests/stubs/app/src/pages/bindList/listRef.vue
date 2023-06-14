<template>
  <span
    v-for="num in nums"
    :ref="api.getRef(num)"
  >{{ num }}</span>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useElementApi } from '../../../../../../src/extracted/useElementApi'
import { bindList } from '../../../../../../src/extracted/bindList'

const nums = ref([0, 1, 2])
const api = useElementApi({ kind: 'list' })
const color = ref('red')

bindList(
  api.elements,
  'class',
  color,
  [],
)

window.testState =  { color }
</script>
