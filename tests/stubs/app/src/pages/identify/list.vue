<template>
  <span
    v-for="num in nums"
    :ref="api.ref(num)"
  >{{ num }}</span>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useListApi } from '../../../../../../src/extracted/useListApi'
import { identify } from '../../../../../../src/affordances/identify'

const nums = ref([0, 1, 2])
const api = useListApi()
const ids = identify(api.list)

window.testState =  { ids }
</script>
