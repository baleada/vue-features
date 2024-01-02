<template>
  <span
    v-for="num in nums"
    :ref="api.ref(num)"
  >{{ num }}</span>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useListApi } from '../../../../../../src/extracted/useListApi'
import { bindAttributeOrProperty } from '../../../../../../src/extracted/bindAttributeOrProperty'

const nums = ref([0, 1, 2])
const api = useListApi()
const count = ref(0)

bindAttributeOrProperty(
  api.list,
  'id',
  count,
  [],
)

window.testState =  { count }
</script>
