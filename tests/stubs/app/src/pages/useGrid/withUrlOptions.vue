<template>
  <!-- focus target for tests -->
  <input type="text" />
  <div
    :ref="grid.root.ref()"
    class="mt-4 h-[90vh] overflow-y-scroll mx-auto w-[990px] p-0.5 select-none text-black"
  >
    <div
      class="grid grid-cols-1"
      :ref="grid.rowgroups.ref(0)"
    >
      <div
        v-for="(r, row) in gridData"
        :ref="grid.rows.ref(row)"
        class="grid grid-cols-5"
      >
        <div
          v-for="(cell, column) in r"
          :ref="grid.cells.ref(
            [row, column],
            {
              // kind: row === 0 ? 'rowheader' : 'cell',
              // ability: /[Ff,zxq]/.test(cell) ? 'disabled' : 'enabled',
            }
          )"
          class="relative flex items-center text-left h-12 p-4 focus:outline-none"
          :class="[
            (row === grid.superselected.value[0]?.[0] && column === grid.superselected.value[0]?.[1])
              ? 'bg-zinc-50'
              : toCellBg(grid.total.selected([row, column])),
            (
              (!grid.superselected.value.length && grid.is.focused([row, column]))
              || (
                row === superselectedBounds.maxRow
                && column === superselectedBounds.maxColumn
              )
            ) && 'after:z-20 after:w-1.5 after:h-1.5 after:rounded-sm after:bg-green-800 after:absolute after:bottom-0 after:right-0 after:translate-y-1/2 after:translate-x-1/2 after:ring-1 after:ring-white',
            grid.is.disabled([row, column]) && 'opacity-50 text-red-600'
          ]"
        >
          <span :class="{ truncate: column === 1 }">{{ cell }}</span>
          <span
            class="w-full h-px absolute top-0 left-0 -translate-y-1/2"
            :class="[toCellBorder(grid.total.selected([row, column]))]"
          ></span>
          <span
            class="w-full h-px absolute bottom-0 left-0 translate-y-1/2"
            :class="[toCellBorder(grid.total.selected([row, column]))]"
          ></span>
          <span
            class="w-px h-full absolute top-0 left-0 -translate-x-1/2"
            :class="[toCellBorder(grid.total.selected([row, column]))]"
          ></span>
          <span
            class="w-px h-full absolute top-0 right-0 translate-x-1/2"
            :class="[toCellBorder(grid.total.selected([row, column]))]"
          ></span>
          <span
            v-show="
              (!grid.superselected.value.length && grid.is.focused([row, column]))
              || (grid.is.superselected([row, column]) && row === superselectedBounds.minRow)
            "
            class="z-10 w-full h-0.5 absolute top-0 left-0 -translate-y-1/2 bg-green-800"
          ></span>
          <span
            v-show="
              (!grid.superselected.value.length && grid.is.focused([row, column]))
              || (grid.is.superselected([row, column]) && row === superselectedBounds.maxRow)
            "
            class="z-10 w-full h-0.5 absolute bottom-0 left-0 translate-y-1/2 bg-green-800"
          ></span>
          <span
            v-show="
              (!grid.superselected.value.length && grid.is.focused([row, column]))
              || (grid.is.superselected([row, column]) && column === superselectedBounds.minColumn)
            "
            class="z-10 w-0.5 h-full absolute top-0 left-0 -translate-x-1/2 bg-green-800"
          ></span>
          <span
            v-show="
              (!grid.superselected.value.length && grid.is.focused([row, column]))
              || (grid.is.superselected([row, column]) && column === superselectedBounds.maxColumn)
            "
            class="z-10 w-0.5 h-full absolute top-0 right-0 translate-x-1/2 bg-green-800"
          ></span>
        </div>
      </div>
    </div>
  </div>
  <pre class="absolute top-2 left-32 text-indigo-700"><code>query: {{  grid.query.value }}</code></pre>
</template>

<script setup lang="ts">
import { useGrid } from '../../../../../../src/interfaces'
import { portfolio } from '@alexvipond/mulago-foundation-portfolio'
import { getOptions } from '../../getParam'
import { computed } from 'vue';
import { pipe, min, max, map } from 'lazy-collections'

const gridData = (() => {
  return portfolio.reduce((rows, { name, website, investments, fellows }) => {
    rows.push([
      name,
      website,
      `Investments: ${investments.length}`,
      investments.map(({ type }) => type).join(', '),
      fellows.henry || fellows.rainer,
    ])
    return rows
  }, [] as string[][])
})()

const grid = useGrid(getOptions())

const superselectedBounds = computed(() => ({
  minRow: pipe(
    map(([row]) => row),
    min(),
  )(grid.superselected.value),
  maxRow: pipe(
    map(([row]) => row),
    max(),
  )(grid.superselected.value),
  minColumn: pipe(
    map(([_, column]) => column),
    min(),
  )(grid.superselected.value),
  maxColumn: pipe(
    map(([_, column]) => column),
    max(),
  )(grid.superselected.value),
}))

function toCellBg (total: number) {
  switch (total) {
    case 0: return 'bg-transparent'
    case 1: return 'bg-zinc-300'
    case 2: return 'bg-zinc-400'
    case 3: return 'bg-zinc-500'
    case 4: return 'bg-zinc-600'
    case 5: return 'bg-zinc-700'
    case 6: return 'bg-zinc-800'
    case 7: return 'bg-zinc-900'
    default: return 'bg-zinc-950'
  }
}

function toCellBorder (total: number) {
  switch (total) {
    case 0: return 'bg-zinc-300'
    case 1: return 'bg-zinc-400'
    case 2: return 'bg-zinc-500'
    case 3: return 'bg-zinc-600'
    case 4: return 'bg-zinc-700'
    case 5: return 'bg-zinc-800'
    case 6: return 'bg-zinc-900'
    case 7: return 'bg-zinc-950'
    default: return 'bg-black'
  }
}

window.testState =  { grid }
</script>
