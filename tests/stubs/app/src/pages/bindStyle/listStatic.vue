<template>
  <span
    v-for="num in nums"
    :ref="api.ref(num)"
  >{{ num }}</span>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useListApi } from '../../../../../../src/extracted/useListApi'
import { bindStyle } from '../../../../../../src/extracted/bindStyle'

const nums = ref([0, 1, 2])
const api = useListApi()

bindStyle(
  api.list,
  'backgroundColor',
  'red',
  [],
)

window.testState =  {  }
</script>
