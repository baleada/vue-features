<template>
  <div class="grid grid-rows-2 grid-cols-3">
    <template v-for="(columns, row) in rows">
      <span
        v-for="(cell, column) in columns"
        :key="`${row},${cell}`"
        :ref="api.ref(row, column, { candidate: row === 1 ? '' : rows[row][column].candidate })"
      >
        <span>{{ cell.title }}: </span><span>{{ cell.candidate }}</span>
      </span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { usePlaneApi } from '../../../../../../src/extracted/usePlaneApi'
import { usePlaneQuery } from '../../../../../../src/extracted/usePlaneQuery'

const rows = [
  [
    { title: 'Item 1', candidate: 'e' },
    { title: 'Item 2', candidate: 'f' },
    { title: 'Item 3', candidate: 'g' },
  ],
  [
    { title: 'Item 4', candidate: 'h' },
    { title: 'Item 5', candidate: 'i' },
    { title: 'Item 6', candidate: 'j' },
  ],
  [
    { title: 'Item 7', candidate: 'k' },
    { title: 'Item 8', candidate: 'l' },
    { title: 'Item 9', candidate: 'm' },
  ],
]
const api = usePlaneApi({
  identifies: true,
  defaultMeta: { candidate: '' }
})
const planeQuery = usePlaneQuery({ api })

window.testState =  { planeQuery }
</script>
