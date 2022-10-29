<template>
  <span ref="identifying" />
  <span :ref="identified.root.getRef()" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDetails } from '../../../../../../src/extensions/useDetails'
import { WithGlobals } from '../../../../../fixtures/types';

const identifying = ref(null),
      identified = useDetails(identifying)

;(window as unknown as WithGlobals).testState = { identifying, identified }
</script>
