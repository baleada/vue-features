<template>
  <span ref="stub" id="stub" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { identify } from '../../../../../../src/affordances'
import { WithGlobals } from '../../../../../fixtures/types'

const stub = ref(null),
      id = identify(stub)

onMounted(() => (window as unknown as WithGlobals).testState =  { id })
</script>

