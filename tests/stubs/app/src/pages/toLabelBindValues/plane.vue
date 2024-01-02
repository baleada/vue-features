<template>
  <div class="grid grid-cols-3 grid-rows-2">
    <template v-for="(row, rowIndex) in rows">
      <span
        v-for="(column, columnIndex) in columns"
        :key="`${row},${column}`"
        :ref="api.ref(rowIndex, columnIndex, {
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
import { usePlaneApi } from '../../../../../../src/extracted/usePlaneApi'
import { bind } from '../../../../../../src/affordances/bind'
import { toLabelBindValues } from '../../../../../../src/extracted/toLabelBindValues'

const api = usePlaneApi({ identifies: true }),
      rows = [0, 1],
      columns = [0, 1, 2]

bind(
  api.plane,
  toLabelBindValues(api),
)

window.testState =  { api }
</script>
