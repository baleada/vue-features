<template>
  <!-- focus target for tests -->
  <input type="text" />
  <div
    :ref="grid.root.ref()"
    class="mx-auto w-[600px] grid grid-cols-1 gap-6 select-none"
  >
    <div
      v-for="(columns, row) in interesting"
      :ref="grid.rows.ref(row)"
      class="grid grid-cols-3 gap-6"
    >
      <div
        v-for="(cell, column) in columns"
        :ref="
          grid.cells.ref(
            [row, column],
            {
              ability: (row < interesting.length - 1 && column < columns.length - 1) ? 'enabled' : 'disabled',
            }
          )
        "
        class="overflow-hidden border border-gray-300"
        :class="{
          'bg-green-100': grid.is.selected([row, column]),
          'cursor-not-allowed': grid.is.disabled([row, column]),
        }"
      >
        <span>{{ cell }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGrid, UseGridOptions } from '../../../../../../src/interfaces'
import { interesting } from '../useGrid/cellMetadata'

const grid = useGrid(JSON.parse(new URLSearchParams(window.location.search).get('options') || '{}'))

window.testState =  { grid }
</script>
