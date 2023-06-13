<template>
  <span ref="identifying" />
  <span :ref="identified.root.getRef()" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDescription } from '../../../../../../src/extensions/useDescription'
import { WithGlobals } from '../../../../../fixtures/types';

const identifying = ref(null),
      identified = useDescription(identifying)

window.testState = { identifying, identified }
</script>
