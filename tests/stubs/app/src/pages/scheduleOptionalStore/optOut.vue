<template>
  <span></span>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { scheduleOptionalStore } from '../../../../../../src/extracted'
import { WithGlobals } from '../../../../../fixtures/types'

const optOutProof = ref(0)

scheduleOptionalStore({
  storeable: undefined,
  optOutEffect: () => optOutProof.value++,
  optInEffect: () => {},
  getString: () => '',
});

(window as unknown as WithGlobals).testState = { optOutProof }
</script>
