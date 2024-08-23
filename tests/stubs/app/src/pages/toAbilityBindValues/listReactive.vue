<template>
  <button
    v-for="num in nums"
    :ref="api.ref(num, {
      ability
    })"
  >{{ num }}</button>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useListApi } from '../../../../../../src/extracted/useListApi'
import { bind } from '../../../../../../src/affordances/bind'
import { toAbilityBindValues } from '../../../../../../src/extracted/toAbilityBindValues'

const nums = [0, 1, 2]
const api = useListApi({ identifies: true })

bind(
  api.list,
  toAbilityBindValues(api)
)

const ability = ref('enabled')

onMounted(() => {
  ability.value = 'disabled'
})

window.testState =  { api }
</script>
