<template>
  <span ref="stub"></span>
  <span :ref="identified.getRef()"></span>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useIdentified } from '../../../../../../src/extracted/useIdentified'
import { WithGlobals } from '../../../../../fixtures/types';

const stub = ref(null),
      attribute = 'aria-details',
      identified = useIdentified({ identifying: stub, attribute })

window.testState = {
  identified,
  identifying: stub,
  attribute,
}
</script>
