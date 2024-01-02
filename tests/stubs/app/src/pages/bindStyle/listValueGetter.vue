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
const colors = ['red', 'blue', 'green']
const api = useListApi()

bindStyle(
  api.list,
  'backgroundColor',
  index => colors[index],
  [],
)

window.testState =  {  }
</script>
