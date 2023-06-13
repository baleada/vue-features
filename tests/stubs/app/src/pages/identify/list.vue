<template>
  <span
    v-for="num in nums"
    :ref="api.getRef(num)"
  >{{ num }}</span>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useElementApi } from '../../../../../../src/extracted/useElementApi'
import { identify } from '../../../../../../src/affordances/identify'
import { WithGlobals } from '../../../../../fixtures/types';

const nums = ref([0, 1, 2])
const api = useElementApi({ kind: 'list' })
const ids = identify(api.elements)

window.testState =  { ids }
</script>
