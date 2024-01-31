<template>
  <!-- focus target for tests -->
  <input type="text" />
  <div
    :ref="grid.root.ref()"
    class="mx-auto w-[600px] select-none"
  >
    <div
      class="grid grid-cols-1 gap-6"
      :ref="grid.rowgroups.ref(0)"
    >
      <div
        v-for="(r, row) in interestingWithColumnHeaders"
        :ref="grid.rows.ref(row)"
        class="grid grid-cols-3 gap-6"
      >
        <div
          v-for="(cell, column) in r"
          :ref="grid.cells.ref(
            [row, column],
            {
              kind: row === 0 ? 'rowheader' : 'cell'
            }
          )"
          class="overflow-hidden border border-gray-300"
          :class="{
            'bg-green-100': grid.is.selected([row, column]),
          }"
        >
          <span>{{ cell }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGrid } from '../../../../../../src/interfaces'
import { interestingWithColumnHeaders } from './cellMetadata'
import { getOptions } from '../../getOptions'

const grid = useGrid(getOptions())

window.testState =  { grid }
</script>
