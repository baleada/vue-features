<template>
  <span
    v-for="num in nums"
    :ref="api.ref(num, {
      label,
      labelledBy,
      description,
      describedBy,
      errorMessage,
      details,
    })"
  >{{ num }}</span>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useListApi } from '../../../../../../src/extracted/useListApi'
import { bind } from '../../../../../../src/affordances/bind'
import { toLabelBindValues } from '../../../../../../src/extracted/toLabelBindValues'

const nums = [0, 1, 2]
const api = useListApi({ identifies: true })

bind(
  api.list,
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
