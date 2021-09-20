<template>
  <label :ref="label.ref"></label>
  <span ref="stub" id="stub"></span>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLabel } from '../../../../../../src/extracted'
import { WithGlobals } from '../../../../../fixtures/types';

const stub = ref(null),
      label = useLabel(stub, { htmlFor: computed(() => stub.value?.id) });

(window as unknown as WithGlobals).testState = { label, labelled: stub }
</script>
