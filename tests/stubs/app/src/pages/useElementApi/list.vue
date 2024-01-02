<template>
  <span
    v-for="num in nums"
    :class="`${num}`"
    :ref="api.getRef(num)"
  >{{ num }}</span>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useListApi } from '../../../../../../src/extracted/useListApi'

const nums = ref([0, 1, 2])
const api = useListApi()

window.testState =  { api, nums }
</script>
