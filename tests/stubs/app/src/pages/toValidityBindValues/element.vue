<template>
  <span :ref="api.ref({ validity: 'invalid' })"></span>
</template>

<script setup lang="ts">
import { useElementApi } from '../../../../../../src/extracted/useElementApi'
import { bind } from '../../../../../../src/affordances/bind'
import { toValidityBindValues } from '../../../../../../src/extracted/toValidityBindValues'

const api = useElementApi({ identifies: true })

bind(
  api.element,
  toValidityBindValues(api)
)

window.testState =  { api }
</script>
