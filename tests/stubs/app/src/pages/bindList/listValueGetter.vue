<template>
  <span
    v-for="num in nums"
    :ref="api.getRef(num)"
  >{{ num }}</span>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useElementApi } from '../../../../../../src/extracted/useElementApi'
import { WithGlobals } from '../../../../../fixtures/types';
import { bindList } from '../../../../../../src/extracted/bindList'

const nums = ref([0, 1, 2])
const api = useElementApi({ kind: 'list' })

bindList(
  api.elements,
  'class',
  index => `${index}`,
  [],
)

;(window as unknown as WithGlobals).testState =  {  }
</script>
