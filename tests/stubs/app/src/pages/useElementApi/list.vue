<template>
  <span
    v-for="num in nums"
    :class="`${num}`"
    :ref="api.getRef(num)"
  >{{ num }}</span>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useElementApi } from '../../../../../../src/extracted/useElementApi'
import { WithGlobals } from '../../../../../fixtures/types';

const nums = ref([0, 1, 2])
const api = useElementApi({ kind: 'list' })

;(window as unknown as WithGlobals).testState =  { api, nums }
</script>
