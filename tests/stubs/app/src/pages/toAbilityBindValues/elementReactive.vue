<template>
  <button :ref="api.ref({ ability })"></button>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useElementApi } from '../../../../../../src/extracted/useElementApi'
import { bind } from '../../../../../../src/affordances/bind'
import { toAbilityBindValues } from '../../../../../../src/extracted/toAbilityBindValues'

const api = useElementApi({ identifies: true })

bind(
  api.element,
  toAbilityBindValues(api)
)

const ability = ref('enabled')

onMounted(() => {
  ability.value = 'disabled'
})

window.testState =  { api }
</script>
