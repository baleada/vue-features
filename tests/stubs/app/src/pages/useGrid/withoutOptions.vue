<template>
  <!-- focus target for tests -->
  <input type="text" />
  <div
    :ref="grid.root.ref"
  >
    <div
      :ref="grid.rowgroups.getRef(0)"
    >
      <div
        v-for="(r, row) in interestingWithColumnHeaders.slice(0, 1)"
        :ref="grid.rows.getRef(row)"
        class="grid grid-cols-3 gap-4"
      >
        <div
          v-for="(c, column) in r"
          :ref="grid.cells.getRef(row, column)"
        >
          {{ c }}
        </div>
      </div>
    </div>
    <div
      :ref="grid.rowgroups.getRef(1)"
      class="grid grid-cols-1 gap-4"
    >
      <div
        v-for="(r, row) in interestingWithColumnHeaders.slice(1)"
        :ref="grid.rows.getRef(row + 1)"
        class="grid grid-cols-3 gap-4"
      >
        <div
          v-for="(c, column) in r"
          :ref="grid.cells.getRef(row + 1, column)"
        >
          {{ c }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGrid, UseGridOptions } from '../../../../../../src/interfaces'
import { WithGlobals } from '../../../../../fixtures/types';
import { interestingWithColumnHeaders } from './cellMetadata'

const grid = useGrid({ hasColumnheaders: true })

;(window as unknown as WithGlobals).testState =  { grid }
</script>
