<template>
  <span
    v-for="num in [0, 1, 2]"
    :class="num"
    :ref="api.ref(num)"
  >{{num}}</span>
</template>

<script setup lang="ts">
import { useListApi } from '../../../../../../src/extracted/useListApi'

const api = useListApi({ identifies: true })

window.testState =  { api }
</script>
