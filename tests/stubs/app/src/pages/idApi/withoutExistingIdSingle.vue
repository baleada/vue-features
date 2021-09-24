<template>
  <span ref="stub" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSingleId } from '../../../../../../src/extracted'
import { WithGlobals } from '../../../../../fixtures/types';

const stub = ref(null),
      id = useSingleId(stub)

onMounted(() => (window as unknown as WithGlobals).testState =  { id })
</script>
