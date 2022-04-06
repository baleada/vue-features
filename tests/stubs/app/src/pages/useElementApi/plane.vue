<template>
  <div class="grid grid-rows-2 grid-cols-3">
    <template v-for="row in [0, 1]">
      <span
        v-for="column in [0, 1, 2]"
        :key="row * 3 + column"
        :ref="api.getRef(row, column)"
        :class="`${row},${column}`"
      >{{ row * 3 + column }}</span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useElementApi } from '../../../../../../src/extracted/useElementApi'
import { WithGlobals } from '../../../../../fixtures/types';

const api = useElementApi({ kind: 'plane' })

;(window as unknown as WithGlobals).testState =  { api }
</script>
