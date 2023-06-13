<template>
  <!-- focus target for tests -->
  <input type="text" />
  <div
    :ref="grid.root.getRef()"
    class="mx-auto w-[600px] grid grid-cols-1 gap-6 select-none"
  >
    <div
      v-for="(r, row) in interesting"
      :ref="grid.rows.getRef(row)"
      class="grid grid-cols-3 gap-6"
    >
      <div
        v-for="(c, column) in r"
        :ref="grid.cells.getRef(row, column)"
        class="overflow-hidden border border-gray-300"
        :class="{
          'bg-green-100': grid.is.selected(row, column),
        }"
      >
        <span>{{ c }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGrid, UseGridOptions } from '../../../../../../src/interfaces'
import { WithGlobals } from '../../../../../fixtures/types';
import { interesting } from './cellMetadata'

const grid = useGrid()

window.testState =  { grid }
</script>
