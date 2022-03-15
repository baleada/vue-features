<template>
  <div class="grid grid-rows-2 grid-cols-3">
    <span ref="stub0" class="0"></span>
    <span ref="stub1" class="1"></span>
    <span ref="stub2" class="2"></span>
    <span ref="stub3" class="3"></span>
    <span ref="stub4" class="4"></span>
    <span ref="stub5" class="5"></span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useElementApi } from '../../../../../../src/extracted/useElementApi'
import { WithGlobals } from '../../../../../fixtures/types';

const stub0 = ref(null),
      stub1 = ref(null),
      stub2 = ref(null),
      stub3 = ref(null),
      stub4 = ref(null),
      stub5 = ref(null)

const elementsApi = useElementApi({ kind: 'plane' })

;(window as unknown as WithGlobals).testState =  {
  elementsApi,
  stub0,
  stub1,
  stub2,
  stub3,
  stub4,
  stub5,
}
</script>
