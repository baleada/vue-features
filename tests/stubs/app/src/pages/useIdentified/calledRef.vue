<template>
  <span ref="stub"></span>
  <span :ref="identified.root.ref"></span>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useIdentified } from '../../../../../../src/extracted/useIdentified'
import { WithGlobals } from '../../../../../fixtures/types';

const stub = ref(null),
      attribute = 'aria-details',
      identified = useIdentified({ identifying: stub, attribute });

(window as unknown as WithGlobals).testState = {
  identified,
  identifying: stub,
  attribute,
}
</script>
