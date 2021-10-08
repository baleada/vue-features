<template>
  <span ref="stub"></span>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useElementApi } from '../../../../../../src/extracted'
import { WithGlobals } from '../../../../../fixtures/types';

const stub = ref(null)

const elementApi = useElementApi({ type: 'single' });

(window as unknown as WithGlobals).testState =  { ...elementApi, stub }
</script>
