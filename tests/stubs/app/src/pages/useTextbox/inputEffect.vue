<template>
  <span></span>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { inputEffect } from '../../../../../../src/functions/useTextbox'
import { WithGlobals } from '../../../../../fixtures/types';

const recordNewProof = ref(0),
      recordPreviousProof = ref(0),
      recordNoneProof = ref(0),
      proofs = computed(() => ({
        recordNew: recordNewProof.value,
        recordPrevious: recordPreviousProof.value,
        recordNone: recordNoneProof.value,
      })),
      withProof = (param: Omit<Parameters<typeof inputEffect>[0], 'recordNew' | 'recordPrevious' | 'recordNone'>) => inputEffect({
        ...param,
        recordNew: () => recordNewProof.value++,
        recordPrevious: () => recordPreviousProof.value++,
        recordNone: () => recordNoneProof.value++,
      });

(window as unknown as WithGlobals).testState = { withProof, proofs }
</script>
