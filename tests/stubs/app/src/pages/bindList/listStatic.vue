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

bindList(
  api.list,
  'class',
  'stub',
  [],
)

window.testState =  {  }
</script>
