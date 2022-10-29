<template>
  <span :ref="api.getRef()"></span>
</template>

<script setup lang="ts">
import { useElementApi } from '../../../../../../src/extracted/useElementApi'
import { WithGlobals } from '../../../../../fixtures/types';

const api = useElementApi()

;(window as unknown as WithGlobals).testState =  { api }
</script>
