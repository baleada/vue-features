<template>
  <span :ref="api.ref()" />
</template>

<script setup lang="ts">
import { identify } from '../../../../../../src/affordances/identify'
import { useElementApi } from '../../../../../../src/extracted/useElementApi'

const api = useElementApi(),
      id = identify(api.element)

window.testState =  { id }
</script>

