<template>
  <span :ref="api.ref({ validity })"></span>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useElementApi } from '../../../../../../src/extracted/useElementApi'
import { bind } from '../../../../../../src/affordances/bind'
import { toValidityBindValues } from '../../../../../../src/extracted/toValidityBindValues'

const api = useElementApi({ identifies: true })

bind(
  api.element,
  toValidityBindValues(api)
)

const validity = ref('valid')

onMounted(() => {
  validity.value = 'invalid'
})

window.testState =  { api }
</script>
