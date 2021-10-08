<template>
  <span ref="stub0" class="0"></span>
  <span ref="stub1" class="1"></span>
  <span ref="stub2" class="2"></span>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useElementApi } from '../../../../../../src/extracted'
import { WithGlobals } from '../../../../../fixtures/types';

const stub0 = ref(null),
      stub1 = ref(null),
      stub2 = ref(null)

const elementApi = useElementApi({ multiple: true });

(window as unknown as WithGlobals).testState =  { ...elementApi, stub0, stub1, stub2 }
</script>
