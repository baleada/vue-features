<template>
  <span
    v-for="num in nums"
    :ref="api.getRef(num)"
  >{{ num }}</span>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useElementApi } from '../../../../../../src/extracted/useElementApi'
import { bindStyle } from '../../../../../../src/extracted/bindStyle'

const nums = ref([0, 1, 2])
const colors = ['red', 'blue', 'green']
const api = useElementApi({ kind: 'list' })

bindStyle(
  api.elements,
  'backgroundColor',
  index => colors[index],
  [],
)

window.testState =  {  }
</script>
