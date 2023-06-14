<template>
  <span :ref="api.getRef()"></span>
</template>

<script setup lang="ts">
import { useElementApi } from '../../../../../../src/extracted/useElementApi'

const api = useElementApi()

window.testState =  { api }
</script>
