<template>
  <!-- focus target for tests -->
  <input type="text" />
  <div
    :ref="grid.root.ref({ ability: rootAbility })"
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
            { row, column },
            {
              ability: (() => {
                if (disabledOptions.length) {
                  return disabledOptions.find(coordinates => coordinates.row === row && coordinates.column === column)
                    ? 'disabled'
                    : 'enabled'
                }
                
                return row < interesting.length - 1 && column < columns.length - 1 ? 'enabled' : 'disabled'
              })()
            }
          )
        "
        class="overflow-hidden border border-gray-300"
        :class="{
          'bg-green-100': grid.is.selected({ row, column }),
          'bg-gray-100': grid.is.disabled({ row, column }),
        }"
      >
        <span>{{ cell }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGrid } from '../../../../../../src/interfaces'
import { interesting } from '../useGrid/cellMetadata'
import { getOptions, getRootAbility, getDisabled } from '../../getParam'

const rootAbility = getRootAbility()
const disabledOptions = getDisabled()
const grid = useGrid(getOptions())

window.testState =  { grid }
</script>
