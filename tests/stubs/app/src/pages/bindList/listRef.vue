<template>
  <span
    v-for="num in nums"
    :ref="api.ref(num)"
  >{{ num }}</span>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useListApi } from '../../../../../../src/extracted/useListApi'
import { bindList } from '../../../../../../src/extracted/bindList'

const nums = ref([0, 1, 2])
const api = useListApi()
const color = ref('red')

bindList(
  api.list,
  'class',
  color,
  [],
)

window.testState =  { color }
</script>
