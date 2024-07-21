<template>
  <!-- focus target for tests -->
  <input type="text" />
  <div
    :ref="grid.root.ref()"
    class="mx-auto grid grid-cols-1 gap-6 select-none"
  >
    <div
      v-for="(columns, row) in data"
      :ref="grid.rows.ref(row)"
      class="mx-auto grid grid-cols-7 gap-4"
    >
      <div
        v-for="(cell, column) in columns"
        :ref="
          grid.cells.ref(
            { row, column },
            {
              ability: disabled.some(coordinates => createCoordinatesEqual({ row, column })(coordinates))
                ? 'disabled'
                : 'enabled'
            }
          )
        "
        class="h-[3em] w-[3em] flex items-center justify-center p-1 font-mono rounded"
        :class="[
          (() => {
            if (grid.is.selected({ row, column })) {
              return 'bg-green-200 text-green-900'
            }

            if (grid.is.disabled({ row, column })) {
              return 'bg-gray-200 text-gray-900 cursor-not-allowed'
            }

            return 'bg-blue-200 text-blue-900'
          })()
        ]"
      >
        <span>{{ row }}, {{ column }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGrid } from '../../../../../../src/interfaces'
import { getOptions, getDisabled } from '../../getParam'
import { createCoordinatesEqual } from '../../../../../../src/extracted/createCoordinatesEqual';

const data = new Array(7)
  .fill(0)
  .map(
    () => new Array(7)
      .fill(0)
      .map((_, index) => index)
  )

const disabled = getDisabled() || []

const grid = useGrid(getOptions())

window.testState =  { grid }
</script>
