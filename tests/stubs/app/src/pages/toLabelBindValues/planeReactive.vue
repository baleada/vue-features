<template>
  <div class="grid grid-cols-3 grid-rows-2">
    <template v-for="(row, rowIndex) in rows">
      <span
        v-for="(column, columnIndex) in columns"
        :key="`${row},${column}`"
        :ref="api.ref({ row: rowIndex, column: columnIndex }, {
          label,
          labelledBy,
          description,
          describedBy,
          errorMessage,
          details,
        })"
      >{{ `${row},${column}` }}</span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { usePlaneApi } from '../../../../../../src/extracted/usePlaneApi'
import { bind } from '../../../../../../src/affordances/bind'
import { toLabelBindValues } from '../../../../../../src/extracted/toLabelBindValues'

const api = usePlaneApi({ identifies: true }),
      rows = [0, 1],
      columns = [0, 1, 2]

bind(
  api.plane,
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
