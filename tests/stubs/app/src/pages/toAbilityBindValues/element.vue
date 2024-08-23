<template>
  <button :ref="api.ref({ ability: 'disabled' })"></button>
</template>

<script setup lang="ts">
import { useElementApi } from '../../../../../../src/extracted/useElementApi'
import { bind } from '../../../../../../src/affordances/bind'
import { toAbilityBindValues } from '../../../../../../src/extracted/toAbilityBindValues'

const api = useElementApi({ identifies: true })

bind(
  api.element,
  toAbilityBindValues(api)
)

window.testState =  { api }
</script>
