<template>
  <label :ref="label.ref"></label>
  <span ref="stub"></span>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useLabel } from '../../../../../../src/extracted'
import { WithGlobals } from '../../../../../fixtures/types';

const stub = ref(null),
      label = useLabel(stub);

(window as unknown as WithGlobals).testState = { label, labelled: stub }
</script>
