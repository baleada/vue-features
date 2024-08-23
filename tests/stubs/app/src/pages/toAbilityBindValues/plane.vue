<template>
  <div class="grid grid-cols-3 grid-rows-2">
    <template v-for="(row, rowIndex) in rows">
      <button
        v-for="(column, columnIndex) in columns"
        :key="`${row},${column}`"
        :ref="api.ref({ row: rowIndex, column: columnIndex }, {
          ability: 'disabled',
        })"
      >{{ `${row},${column}` }}</button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { usePlaneApi } from '../../../../../../src/extracted/usePlaneApi'
import { bind } from '../../../../../../src/affordances/bind'
import { toAbilityBindValues } from '../../../../../../src/extracted/toAbilityBindValues'

const api = usePlaneApi({ identifies: true }),
      rows = [0, 1],
      columns = [0, 1, 2]

bind(
  api.plane,
  toAbilityBindValues(api),
)

window.testState =  { api }
</script>
