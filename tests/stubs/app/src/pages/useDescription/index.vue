<template>
  <span ref="identifying" />
  <span :ref="identified.root.ref" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDescription } from '../../../../../../src/extensions/useDescription'
import { WithGlobals } from '../../../../../fixtures/types';

const identifying = ref(null),
      identified = useDescription(identifying);

(window as unknown as WithGlobals).testState = { identifying, identified }
</script>
