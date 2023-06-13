<template>
  <span
    v-for="num in nums"
    :ref="api.getRef(num)"
  >{{ num }}</span>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useElementApi } from '../../../../../../src/extracted/useElementApi'
import { WithGlobals } from '../../../../../fixtures/types';
import { bindStyle } from '../../../../../../src/extracted/bindStyle'

const nums = ref([0, 1, 2])
const api = useElementApi({ kind: 'list' })
const color = ref('red')

bindStyle(
  api.elements,
  'backgroundColor',
  color,
  [],
)

window.testState =  { color }
</script>
