<template>
  <span></span>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useOptionalStoreable } from '../../../../../../src/extracted'
import { WithGlobals } from '../../../../../fixtures/types'

const optOutProof = ref(0)

const storeable = useOptionalStoreable({
  key: '',
  optOutEffect: () => optOutProof.value++,
  optInEffect: () => {},
  getString: () => '',
});

(window as unknown as WithGlobals).testState = { storeable, optOutProof }
</script>
