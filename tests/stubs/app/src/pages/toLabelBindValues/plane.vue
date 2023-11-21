<template>
  <div class="grid grid-cols-3 grid-rows-2">
    <template v-for="(row, rowIndex) in rows">
      <span
        v-for="(column, columnIndex) in columns"
        :key="`${row},${column}`"
        :ref="api.getRef(rowIndex, columnIndex, {
          label: 'label',
          labelledby: 'labelledby',
          description: 'description',
          describedBy: 'describedBy',
          errorMessage: 'errorMessage',
          details: 'details',
        })"
      >{{ `${row},${column}` }}</span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useElementApi } from '../../../../../../src/extracted/useElementApi'
import { bind } from '../../../../../../src/affordances/bind'
import { toLabelBindValues } from '../../../../../../src/extracted/toLabelBindValues'

const api = useElementApi({ kind: 'plane', identifies: true }),
      rows = [0, 1],
      columns = [0, 1, 2]

bind(
  api.elements,
  toLabelBindValues(api),
)

window.testState =  { api }
</script>
