<template>
  <label :ref="label.ref"></label>
  <span ref="stub" id="stub"></span>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLabel } from '../../../../../../src/extensions'
import { WithGlobals } from '../../../../../fixtures/types';

const stub = ref(null),
      label = useLabel(stub, { bindsHtmlFor: true });

(window as unknown as WithGlobals).testState = { label, labelled: stub }
</script>
