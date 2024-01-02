<template>
  <span
    v-for="num in nums"
    :ref="api.getRef(num)"
  >{{ num }}</span>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useListApi } from '../../../../../../src/extracted/useListApi'
import { bindStyle } from '../../../../../../src/extracted/bindStyle'

const nums = ref([0, 1, 2])
const api = useListApi()
const color = ref('red')

bindStyle(
  api.list,
  'backgroundColor',
  color,
  [],
)

window.testState =  { color }
</script>
