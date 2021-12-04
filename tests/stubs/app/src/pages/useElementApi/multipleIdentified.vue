<template>
  <span :ref="elementsApi.getRef(0)" class="0"></span>
  <span :ref="elementsApi.getRef(1)" class="1"></span>
  <span :ref="elementsApi.getRef(2)" class="2"></span>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useElementApi } from '../../../../../../src/extracted'
import { WithGlobals } from '../../../../../fixtures/types';

const stub0 = ref(null),
      stub1 = ref(null),
      stub2 = ref(null)

const elementsApi = useElementApi({ multiple: true, identified: true });

(window as unknown as WithGlobals).testState =  { elementsApi, stub0, stub1, stub2 }
</script>
