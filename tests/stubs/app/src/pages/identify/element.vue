<template>
  <span :ref="api.ref" />
</template>

<script setup lang="ts">
import { identify } from '../../../../../../src/affordances/identify'
import { useElementApi } from '../../../../../../src/extracted/useElementApi'
import { WithGlobals } from '../../../../../fixtures/types'

const api = useElementApi(),
      id = identify(api.element)

;(window as unknown as WithGlobals).testState =  { id }
</script>

