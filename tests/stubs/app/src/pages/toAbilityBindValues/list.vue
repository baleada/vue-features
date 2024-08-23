<template>
  <button
    v-for="num in nums"
    :ref="api.ref(num, {
      ability: 'disabled',
    })"
  >{{ num }}</button>
</template>

<script setup lang="ts">
import { useListApi } from '../../../../../../src/extracted/useListApi'
import { bind } from '../../../../../../src/affordances/bind'
import { toAbilityBindValues } from '../../../../../../src/extracted/toAbilityBindValues'

const nums = [0, 1, 2]
const api = useListApi({ identifies: true })

bind(
  api.list,
  toAbilityBindValues(api),
)

window.testState = { api }
</script>
