<template>
  <span
    v-for="num in nums"
    :ref="api.getRef(num, {
      label: 'label',
      labelledby: 'labelledby',
      description: 'description',
      describedBy: 'describedBy',
      errorMessage: 'errorMessage',
      details: 'details',
    })"
  >{{ num }}</span>
</template>

<script setup lang="ts">
import { useElementApi } from '../../../../../../src/extracted/useElementApi'
import { bind } from '../../../../../../src/affordances/bind'
import { toLabelBindValues } from '../../../../../../src/extracted/toLabelBindValues'

const nums = [0, 1, 2]
const api = useElementApi({ kind: 'list', identifies: true })

bind(
  api.elements,
  toLabelBindValues(api),
)

window.testState = { api }
</script>
