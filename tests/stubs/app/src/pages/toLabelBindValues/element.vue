<template>
  <span :ref="api.ref({
    label: 'label',
    labelledBy: 'labelledBy',
    description: 'description',
    describedBy: 'describedBy',
    errorMessage: 'errorMessage',
    details: 'details',
  })"></span>
</template>

<script setup lang="ts">
import { useElementApi } from '../../../../../../src/extracted/useElementApi'
import { bind } from '../../../../../../src/affordances/bind'
import { toLabelBindValues } from '../../../../../../src/extracted/toLabelBindValues'

const api = useElementApi({ identifies: true })

bind(
  api.element,
  toLabelBindValues(api)
)

window.testState =  { api }
</script>
