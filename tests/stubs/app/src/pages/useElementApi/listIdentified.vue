<template>
  <span
    v-for="num in [0, 1, 2]"
    :class="num"
    :ref="api.getRef(num)"
  >{{num}}</span>
</template>

<script setup lang="ts">
import { useElementApi } from '../../../../../../src/extracted/useElementApi'
import { WithGlobals } from '../../../../../fixtures/types';

const api = useElementApi({ kind: 'list', identified: true })

window.testState =  { api }
</script>
