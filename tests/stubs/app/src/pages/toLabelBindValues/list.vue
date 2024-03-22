<template>
  <span
    v-for="num in nums"
    :ref="api.ref(num, {
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
import { useListApi } from '../../../../../../src/extracted/useListApi'
import { bind } from '../../../../../../src/affordances/bind'
import { toLabelBindValues } from '../../../../../../src/extracted/toLabelBindValues'

const nums = [0, 1, 2]
const api = useListApi({ identifies: true })

bind(
  api.list,
  toLabelBindValues(api),
)

window.testState = { api }
</script>
