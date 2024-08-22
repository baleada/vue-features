<template>
  <span :ref="api.ref({
    label,
    labelledBy,
    description,
    describedBy,
    errorMessage,
    details,
  })"></span>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useElementApi } from '../../../../../../src/extracted/useElementApi'
import { bind } from '../../../../../../src/affordances/bind'
import { toLabelBindValues } from '../../../../../../src/extracted/toLabelBindValues'

const api = useElementApi({ identifies: true })

bind(
  api.element,
  toLabelBindValues(api)
)

const label = ref(undefined)
const labelledBy = ref(undefined)
const description = ref(undefined)
const describedBy = ref(undefined)
const errorMessage = ref(undefined)
const details = ref(undefined)

onMounted(() => {
  label.value = 'label'
  labelledBy.value = 'labelledBy'
  description.value = 'description'
  describedBy.value = 'describedBy'
  errorMessage.value = 'errorMessage'
  details.value = 'details'
})

window.testState =  { api }
</script>
