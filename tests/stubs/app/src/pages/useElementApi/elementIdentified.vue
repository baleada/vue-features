<template>
  <span :ref="api.ref()"></span>
</template>

<script setup lang="ts">
import { useElementApi } from '../../../../../../src/extracted/useElementApi'

const api = useElementApi({ identifies: true })

window.testState =  { api }
</script>
