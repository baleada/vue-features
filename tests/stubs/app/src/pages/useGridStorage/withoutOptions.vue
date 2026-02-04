<template>
  <div :ref="grid.root.ref()">
    <div
      v-for="(r, row) in interesting"
      :ref="grid.rows.ref(row)"
    >
      <div
        v-for="(c, column) in r"
        :ref="grid.cells.ref({ row, column })"
      >
        <span>{{ c }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGrid } from '../../../../../../src/interfaces'
import { useGridStorage } from '../../../../../../src/extensions'
import { interesting } from '../useGrid/cellMetadata'

const grid = useGrid(),
      storage = useGridStorage(grid);

const cleanup = () => {
  storage.storeable.remove()
  storage.storeable.removeStatus()
}

window.testState = { grid, storage, cleanup }
</script>
