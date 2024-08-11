import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'
import { toOptionsParam, toDisabledPlaneParam } from '../../toParam'

const suite = withPlaywright(
  createSuite('usePlaneInteractions')
)

for (const {
  modifier,
  arrow,
  combo,
  expectedDescription,
  initialFocused,
  expected,
} of [
  {
    modifier: 'Meta',
    arrow: 'ArrowUp',
    combo: 'cmd+up',
    expectedDescription: 'first eligible in column',
    initialFocused: { row: 6, column: 6 },
    expected: { row: 0, column: 6 },
  },
  {
    modifier: 'Control',
    arrow: 'ArrowUp',
    combo: 'ctrl+up',
    expectedDescription: 'first eligible in column',
    initialFocused: { row: 6, column: 6 },
    expected: { row: 0, column: 6 },
  },
  {
    modifier: 'Meta',
    arrow: 'ArrowLeft',
    combo: 'cmd+left',
    expectedDescription: 'first eligible in row',
    initialFocused: { row: 6, column: 6 },
    expected: { row: 6, column: 0 },
  },
  {
    modifier: 'Control',
    arrow: 'ArrowLeft',
    combo: 'ctrl+left',
    expectedDescription: 'first eligible in row',
    initialFocused: { row: 6, column: 6 },
    expected: { row: 6, column: 0 },
  },
  {
    modifier: 'Meta',
    arrow: 'ArrowDown',
    combo: 'cmd+down',
    expectedDescription: 'last eligible in column',
    initialFocused: { row: 0, column: 0 },
    expected: { row: 6, column: 0 },
  },
  {
    modifier: 'Control',
    arrow: 'ArrowDown',
    combo: 'ctrl+down',
    expectedDescription: 'last eligible in column',
    initialFocused: { row: 0, column: 0 },
    expected: { row: 6, column: 0 },
  },
  {
    modifier: 'Meta',
    arrow: 'ArrowRight',
    combo: 'cmd+right',
    expectedDescription: 'last eligible in row',
    initialFocused: { row: 0, column: 0 },
    expected: { row: 0, column: 6 },
  },
  {
    modifier: 'Control',
    arrow: 'ArrowRight',
    combo: 'ctrl+right',
    expectedDescription: 'last eligible in row',
    initialFocused: { row: 0, column: 0 },
    expected: { row: 0, column: 6 },
  },
  {
    modifier: false,
    arrow: 'ArrowUp',
    combo: 'up',
    expectedDescription: 'previous eligible in column',
    initialFocused: { row: 3, column: 3 },
    expected: { row: 2, column: 3 },
  },
  {
    modifier: false,
    arrow: 'ArrowLeft',
    combo: 'left',
    expectedDescription: 'previous eligible in row',
    initialFocused: { row: 3, column: 3 },
    expected: { row: 3, column: 2 },
  },
  {
    modifier: false,
    arrow: 'ArrowDown',
    combo: 'down',
    expectedDescription: 'next eligible in column',
    initialFocused: { row: 3, column: 3 },
    expected: { row: 4, column: 3 },
  },
  {
    modifier: false,
    arrow: 'ArrowRight',
    combo: 'right',
    expectedDescription: 'next eligible in column',
    initialFocused: { row: 3, column: 3 },
    expected: { row: 3, column: 4 },
  },
  {
    modifier: false,
    arrow: 'Home',
    combo: 'home',
    expectedDescription: 'first eligible',
    initialFocused: { row: 6, column: 6 },
    expected: { row: 0, column: 0 },
  },
  {
    modifier: false,
    arrow: 'End',
    combo: 'end',
    expectedDescription: 'last eligible',
    initialFocused: { row: 0, column: 0 },
    expected: { row: 6, column: 6 },
  },
]) {
  suite(`${combo} focuses ${expectedDescription}`, async ({ playwright: { page } }) => {
    const options = {
      clears: true,
      initialSelected: [],
      initialFocused,
      multiselectable: false,
    }
    const url = `http://localhost:5173/usePlaneInteractions${toOptionsParam(options)}`
    await page.goto(url)
    await page.waitForSelector('div', { state: 'attached' })

    await page.evaluate(() => window.testState.grid.focusedElement.value.focus())

    if (typeof modifier === 'string') await page.keyboard.down(modifier)
    await page.keyboard.down(arrow)

    const value = await page.evaluate(() => window.testState.grid.focused.value)

    if (typeof modifier === 'string') await page.keyboard.up(modifier)
    await page.keyboard.up(arrow)

    assert.equal(value, expected, url)
  })

  suite(`when selecting, ${combo} focuses ${expectedDescription}`, async ({ playwright: { page } }) => {
    const options = {
      clears: true,
      initialSelected: [],
      initialFocused,
      initialStatus: 'selecting',
      multiselectable: false,
    }
    const url = `http://localhost:5173/usePlaneInteractions${toOptionsParam(options)}`
    await page.goto(url)
    await page.waitForSelector('div', { state: 'attached' })

    await page.evaluate(() => window.testState.grid.focusedElement.value.focus())

    if (typeof modifier === 'string') await page.keyboard.down(modifier)
    await page.keyboard.down(arrow)

    const value = await page.evaluate(() => window.testState.grid.focused.value)

    if (typeof modifier === 'string') await page.keyboard.up(modifier)
    await page.keyboard.up(arrow)

    assert.equal(value, expected, url)
  })

  suite(`when selecting and ${expectedDescription} is disabled, ${combo} focuses ${expectedDescription} and omits`, async ({ playwright: { page } }) => {
    const options = {
      clears: true,
      initialSelected: [],
      initialFocused,
      initialStatus: 'selecting',
      multiselectable: false,
    }
    const url = `http://localhost:5173/usePlaneInteractions${toOptionsParam(options)}${toDisabledPlaneParam([expected])}`
    await page.goto(url)
    await page.waitForSelector('div', { state: 'attached' })

    await page.evaluate(() => window.testState.grid.focusedElement.value.focus())

    if (typeof modifier === 'string') await page.keyboard.down(modifier)
    await page.keyboard.down(arrow)

    const value = await page.evaluate(() => [
      window.testState.grid.focused.value,
      window.testState.grid.selected.value.length,
    ])

    if (typeof modifier === 'string') await page.keyboard.up(modifier)
    await page.keyboard.up(arrow)

    assert.equal(value, [expected, 0], url)
  })
}

suite('when clears, esc clears selection', async ({ playwright: { page } }) => {
  const options = {
    clears: true,
    initialSelected: { row: 3, column: 3 },
    multiselectable: false,
  }
  const url = `http://localhost:5173/usePlaneInteractions${toOptionsParam(options)}`
  await page.goto(url)
  await page.waitForSelector('div', { state: 'attached' })

  await page.evaluate(() => window.testState.grid.cells.plane.value.get({ row: 3, column: 3 }).focus())

  await page.keyboard.down('Escape')

  const value = await page.evaluate(() => window.testState.grid.selected.value),
        expected = []

  await page.keyboard.up('Escape')

  assert.equal(value, expected, url)
})

for (const {
  comboDescriptors,
  initialSelected,
  initialFocused,
  initialFocusedDescription,
  expectedFocusedDescription,
  expectedFocused,
  expectedSelectedDescription,
  expectedSelected,
  expectedSuperselectedDescription,
  expectedSuperselected,
} of [
  // SHIFT+CMD/CTRL+UP
  ...[
    {
      initialFocusedDescription: 'top left of superselected',
      initialFocused: { row: 2, column: 2 },
      expectedFocusedDescription: 'first eligible in column',
      expectedFocused: { row: 0, column: 2 },
      expectedSelectedDescription: 'the largest possible expansion of the current selection (i.e. all currently selected cells, plus all eligible cells in previous rows AND within superselected column bounds (selecting from bottom to top and right to left))',
      expectedSelected: [
        ...[2, 3, 4].flatMap(row => [2, 3, 4].map(column => ({ row, column }))),
        ...[0, 1].reverse().flatMap(row => [2, 3, 4].reverse().map(column => ({ row, column }))),
      ],
    },
    {
      initialFocusedDescription: 'bottom left of superselected',
      initialFocused: { row: 4, column: 2 },
      expectedFocusedDescription: 'first eligible in column',
      expectedFocused: { row: 0, column: 2 },
      expectedSelectedDescription: 'a vertical flip of the current selection (i.e. the currently selected row, omitting everything below it, plus all eligible cells in previous rows AND within superselected column bounds (selecting from bottom to top and right to left))',
      expectedSelected: [
        ...[2].flatMap(row => [2, 3, 4].map(column => ({ row, column }))),
        ...[0, 1].reverse().flatMap(row => [2, 3, 4].reverse().map(column => ({ row, column }))),
      ],
    },
    {
      initialFocusedDescription: 'top right of superselected',
      initialFocused: { row: 2, column: 4 },
      expectedFocusedDescription: 'first eligible in column',
      expectedFocused: { row: 0, column: 4 },
      expectedSelectedDescription: 'the largest possible expansion of the current selection (i.e. all currently selected cells, plus all eligible cells in previous rows AND within superselected column bounds (selecting from bottom to top and left to right))',
      expectedSelected: [
        ...[2, 3, 4].flatMap(row => [2, 3, 4].map(column => ({ row, column }))),
        ...[0, 1].reverse().flatMap(row => [2, 3, 4].map(column => ({ row, column }))),
      ],
    },
    {
      initialFocusedDescription: 'bottom right of superselected',
      initialFocused: { row: 4, column: 4 },
      expectedFocusedDescription: 'first eligible in column',
      expectedFocused: { row: 0, column: 4 },
      expectedSelectedDescription: 'a vertical flip of the current selection (i.e. the currently selected row, omitting everything below it, plus all eligible cells in previous rows AND within superselected column bounds (selecting from bottom to top and left to right))',
      expectedSelected: [
        ...[2].flatMap(row => [2, 3, 4].map(column => ({ row, column }))),
        ...[0, 1].reverse().flatMap(row => [2, 3, 4].map(column => ({ row, column }))),
      ],
    },
    {
      initialFocusedDescription: 'inside superselected bounds',
      initialFocused: { row: 3, column: 3 },
      expectedFocusedDescription: 'first eligible in column',
      expectedFocused: { row: 0, column: 3 },
      expectedSelectedDescription: 'all currently selected cells, plus the focused cell, plus all eligible cells previous rows in the focused column (selecting from bottom to top)',
      expectedSelected: [
        ...[2, 3, 4].flatMap(row => [2, 3, 4].map(column => ({ row, column }))),
        ...[0, 1, 2, 3].reverse().flatMap(row => [3].map(column => ({ row, column }))),
      ],
    },
  ].map(rest => ({
    comboDescriptors: [
      { modifier: 'Meta', arrow: 'ArrowUp', combo: 'shift+cmd+up' },
      { modifier: 'Control', arrow: 'ArrowUp', combo: 'shift+ctrl+up' },
    ],
    ...rest,
  })),

  // SHIFT+CMD/CTRL+LEFT
  ...[
    {
      initialFocusedDescription: 'bottom left of superselected',
      initialFocused: { row: 4, column: 2 },
      expectedFocusedDescription: 'first eligible in row',
      expectedFocused: { row: 4, column: 0 },
      expectedSelectedDescription: 'the largest possible expansion of the current selection (i.e. all currently selected cells, plus all eligible cells in previous columns AND within superselected column bounds (selecting from top to bottom and right to left))',
      expectedSelected: [
        ...[2, 3, 4].flatMap(row => [2, 3, 4].map(column => ({ row, column }))),
        ...[0, 1].reverse().flatMap(column => [2, 3, 4].map(row => ({ row, column }))),
      ],
    },
    {
      initialFocusedDescription: 'bottom right of superselected',
      initialFocused: { row: 4, column: 4 },
      expectedFocusedDescription: 'first eligible in row',
      expectedFocused: { row: 4, column: 0 },
      expectedSelectedDescription: 'a horizontal flip of the current selection (i.e. the currently selected column, omitting everything to the right of it, plus all eligible cells in previous columns AND within superselected column bounds (selecting from top to bottom and right to left))',
      expectedSelected: [
        ...[2].flatMap(column => [2, 3, 4].map(row => ({ row, column }))),
        ...[0, 1].reverse().flatMap(column => [2, 3, 4].map(row => ({ row, column }))),
      ],
    },
    {
      initialFocusedDescription: 'top left of superselected',
      initialFocused: { row: 2, column: 2 },
      expectedFocusedDescription: 'first eligible in row',
      expectedFocused: { row: 2, column: 0 },
      expectedSelectedDescription: 'the largest possible expansion of the current selection (i.e. all currently selected cells, plus all eligible cells in previous columns AND within superselected column bounds (selecting from bottom to top and right to left))',
      expectedSelected: [
        ...[2, 3, 4].flatMap(row => [2, 3, 4].map(column => ({ row, column }))),
        ...[0, 1].reverse().flatMap(column => [2, 3, 4].reverse().map(row => ({ row, column }))),
      ],
    },
    {
      initialFocusedDescription: 'top right of superselected',
      initialFocused: { row: 2, column: 4 },
      expectedFocusedDescription: 'first eligible in row',
      expectedFocused: { row: 2, column: 0 },
      expectedSelectedDescription: 'a horizontal flip of the current selection (i.e. the currently selected column, omitting everything to the right of it, plus all eligible cells in previous columns AND within superselected column bounds (selecting from bottom to top and right to left))',
      expectedSelected: [
        ...[2].flatMap(column => [2, 3, 4].map(row => ({ row, column }))),
        ...[0, 1].reverse().flatMap(column => [2, 3, 4].reverse().map(row => ({ row, column }))),
      ],
    },
    {
      initialFocusedDescription: 'inside superselected bounds',
      initialFocused: { row: 3, column: 3 },
      expectedFocusedDescription: 'first eligible in row',
      expectedFocused: { row: 3, column: 0 },
      expectedSelectedDescription: 'all currently selected cells, plus the focused cell, plus all previous columns in the focused row (selecting from right to left)',
      expectedSelected: [
        ...[2, 3, 4].flatMap(row => [2, 3, 4].map(column => ({ row, column }))),
        ...[0, 1, 2, 3].reverse().flatMap(column => [3].map(row => ({ row, column }))),
      ],
    },
  ].map(rest => ({
    comboDescriptors: [
      { modifier: 'Meta', arrow: 'ArrowLeft', combo: 'shift+cmd+left' },
      { modifier: 'Control', arrow: 'ArrowLeft', combo: 'shift+ctrl+left' },
    ],
    ...rest,
  })),

  // SHIFT+CMD/CTRL+DOWN
  ...[
    {
      initialFocusedDescription: 'bottom right of superselected',
      initialFocused: { row: 4, column: 4 },
      expectedFocusedDescription: 'last eligible in column',
      expectedFocused: { row: 6, column: 4 },
      expectedSelectedDescription: 'the largest possible expansion of the current selection (i.e. all currently selected cells, plus all eligible cells in following rows AND within superselected column bounds (selecting from top to bottom and left to right))',
      expectedSelected: [
        ...[2, 3, 4].flatMap(row => [2, 3, 4].map(column => ({ row, column }))),
        ...[5, 6].flatMap(row => [2, 3, 4].map(column => ({ row, column }))),
      ],
    },
    {
      initialFocusedDescription: 'top right of superselected',
      initialFocused: { row: 2, column: 4 },
      expectedFocusedDescription: 'last eligible in column',
      expectedFocused: { row: 6, column: 4 },
      expectedSelectedDescription: 'a vertical flip of the current selection (i.e. the currently selected row, omitting everything above it, plus all eligible cells in following rows AND within superselected column bounds (selecting from top to bottom and left to right))',
      expectedSelected: [
        ...[4].flatMap(row => [2, 3, 4].map(column => ({ row, column }))),
        ...[5, 6].flatMap(row => [2, 3, 4].map(column => ({ row, column }))),
      ],
    },
    {
      initialFocusedDescription: 'bottom left of superselected',
      initialFocused: { row: 4, column: 2 },
      expectedFocusedDescription: 'last eligible in column',
      expectedFocused: { row: 6, column: 2 },
      expectedSelectedDescription: 'the largest possible expansion of the current selection (i.e. all currently selected cells, plus all eligible cells in following rows AND within superselected column bounds (selecting from top to bottom and right to left))',
      expectedSelected: [
        ...[2, 3, 4].flatMap(row => [2, 3, 4].map(column => ({ row, column }))),
        ...[5, 6].flatMap(row => [2, 3, 4].reverse().map(column => ({ row, column }))),
      ],
    },
    {
      initialFocusedDescription: 'top left of superselected',
      initialFocused: { row: 2, column: 2 },
      expectedFocusedDescription: 'last eligible in column',
      expectedFocused: { row: 6, column: 2 },
      expectedSelectedDescription: 'a vertical flip of the current selection (i.e. the currently selected row, omitting everything above it, plus all eligible cells in following rows AND within superselected column bounds (selecting from top to bottom and right to left))',
      expectedSelected: [
        ...[4].flatMap(row => [2, 3, 4].map(column => ({ row, column }))),
        ...[5, 6].flatMap(row => [2, 3, 4].reverse().map(column => ({ row, column }))),
      ],
    },
    {
      initialFocusedDescription: 'inside superselected bounds',
      initialFocused: { row: 3, column: 3 },
      expectedFocusedDescription: 'last eligible in column',
      expectedFocused: { row: 6, column: 3 },
      expectedSelectedDescription: 'all currently selected cells, plus the focused cell, plus all eligible cells in following rows in the focused column (selecting from top to bottom)',
      expectedSelected: [
        ...[2, 3, 4].flatMap(row => [2, 3, 4].map(column => ({ row, column }))),
        ...[3, 4, 5, 6].flatMap(row => [3].map(column => ({ row, column }))),
      ],
    },
  ].map(rest => ({
    comboDescriptors: [
      { modifier: 'Meta', arrow: 'ArrowDown', combo: 'shift+cmd+down' },
      { modifier: 'Control', arrow: 'ArrowDown', combo: 'shift+ctrl+down' },
    ],
    ...rest,
  })),

  // SHIFT+CMD/CTRL+RIGHT
  ...[
    {
      initialFocusedDescription: 'top right of superselected',
      initialFocused: { row: 2, column: 4 },
      expectedFocusedDescription: 'last eligible in row',
      expectedFocused: { row: 2, column: 6 },
      expectedSelectedDescription: 'the largest possible expansion of the current selection (i.e. all currently selected cells, plus all eligible cells in following columns AND within superselected column bounds (selecting from bottom to top and left to right))',
      expectedSelected: [
        ...[2, 3, 4].flatMap(row => [2, 3, 4].map(column => ({ row, column }))),
        ...[5, 6].flatMap(column => [2, 3, 4].reverse().map(row => ({ row, column }))),
      ],
    },
    {
      initialFocusedDescription: 'top left of superselected',
      initialFocused: { row: 2, column: 2 },
      expectedFocusedDescription: 'last eligible in row',
      expectedFocused: { row: 2, column: 6 },
      expectedSelectedDescription: 'a horizontal flip of the current selection (i.e. the currently selected column, omitting everything to the left of it, plus all eligible cells in following columns AND within superselected column bounds (selecting from bottom to top and left to right))',
      expectedSelected: [
        ...[4].flatMap(column => [2, 3, 4].map(row => ({ row, column }))),
        ...[5, 6].flatMap(column => [2, 3, 4].reverse().map(row => ({ row, column }))),
      ],
    },
    {
      initialFocusedDescription: 'bottom right of superselected',
      initialFocused: { row: 4, column: 4 },
      expectedFocusedDescription: 'last eligible in row',
      expectedFocused: { row: 4, column: 6 },
      expectedSelectedDescription: 'the largest possible expansion of the current selection (i.e. all currently selected cells, plus all eligible cells in following columns AND within superselected column bounds (selecting from top to bottom and left to right))',
      expectedSelected: [
        ...[2, 3, 4].flatMap(row => [2, 3, 4].map(column => ({ row, column }))),
        ...[5, 6].flatMap(column => [2, 3, 4].map(row => ({ row, column }))),
      ],
    },
    {
      initialFocusedDescription: 'bottom left of superselected',
      initialFocused: { row: 4, column: 2 },
      expectedFocusedDescription: 'last eligible in row',
      expectedFocused: { row: 4, column: 6 },
      expectedSelectedDescription: 'a horizontal flip of the current selection (i.e. the currently selected column, omitting everything to the left of it, plus all eligible cells in following columns AND within superselected column bounds (selecting from top to bottom and left to right))',
      expectedSelected: [
        ...[4].flatMap(column => [2, 3, 4].map(row => ({ row, column }))),
        ...[5, 6].flatMap(column => [2, 3, 4].map(row => ({ row, column }))),
      ],
    },
    {
      initialFocusedDescription: 'inside superselected bounds',
      initialFocused: { row: 3, column: 3 },
      expectedFocusedDescription: 'last eligible in row',
      expectedFocused: { row: 3, column: 6 },
      expectedSelectedDescription: 'all currently selected cells, plus the focused cell, plus all eligible cells in the following columns in the focused row (selecting from left to right)',
      expectedSelected: [
        ...[2, 3, 4].flatMap(row => [2, 3, 4].map(column => ({ row, column }))),
        ...[3, 4, 5, 6].flatMap(column => [3].map(row => ({ row, column }))),
      ],
    },
  ].map(rest => ({
    comboDescriptors: [
      { modifier: 'Meta', arrow: 'ArrowRight', combo: 'shift+cmd+right' },
      { modifier: 'Control', arrow: 'ArrowRight', combo: 'shift+ctrl+right' },
    ],
    ...rest,
  })),

  // SHIFT+UP
  ...[
    {
      initialFocusedDescription: 'top left of superselected',
      initialFocused: { row: 2, column: 2 },
      expectedFocusedDescription: 'previous eligible in column',
      expectedFocused: { row: 1, column: 2 },
      expectedSelectedDescription: 'an expansion of the current selection (i.e. all currently selected cells, plus all eligible cells in the previous eligible row AND within superselected column bounds (selecting from bottom to top and right to left))',
      expectedSelected: [
        ...[2, 3, 4].flatMap(row => [2, 3, 4].map(column => ({ row, column }))),
        ...[1].flatMap(row => [2, 3, 4].reverse().map(column => ({ row, column }))),
      ],
    },
    {
      initialFocusedDescription: 'top right of superselected',
      initialFocused: { row: 2, column: 4 },
      expectedFocusedDescription: 'previous eligible in column',
      expectedFocused: { row: 1, column: 4 },
      expectedSelectedDescription: 'an expansion of the current selection (i.e. all currently selected cells, plus all eligible cells in the previous eligible row AND within superselected column bounds (selecting from bottom to top and left to right))',
      expectedSelected: [
        ...[2, 3, 4].flatMap(row => [2, 3, 4].map(column => ({ row, column }))),
        ...[1].flatMap(row => [2, 3, 4].map(column => ({ row, column }))),
      ],
    },
    {
      initialFocusedDescription: 'bottom left of superselected',
      initialFocused: { row: 4, column: 2 },
      expectedFocusedDescription: 'previous eligible in column',
      expectedFocused: { row: 3, column: 2 },
      expectedSelectedDescription: 'a contraction of the current selection (i.e. all currently selected cells, minus the focused cell and all eligible cells in the focused row)',
      expectedSelected: [
        ...[2, 3].flatMap(row => [2, 3, 4].map(column => ({ row, column }))),
      ],
    },
    {
      initialFocusedDescription: 'bottom right of superselected',
      initialFocused: { row: 4, column: 4 },
      expectedFocusedDescription: 'previous eligible in column',
      expectedFocused: { row: 3, column: 4 },
      expectedSelectedDescription: 'a contraction of the current selection (i.e. all currently selected cells, minus the focused cell and all eligible cells in the focused row)',
      expectedSelected: [
        ...[2, 3].flatMap(row => [2, 3, 4].map(column => ({ row, column }))),
      ],
    },
    {
      initialFocusedDescription: 'inside superselected bounds',
      initialFocused: { row: 3, column: 3 },
      expectedFocusedDescription: 'previous eligible in column',
      expectedFocused: { row: 2, column: 3 },
      expectedSelectedDescription: 'a single-column expansion of the current selection (i.e. all currently selected cells, plus the focused cell, plus the previous eligible cell in the focused column)',
      expectedSelected: [
        ...[2, 3, 4].flatMap(row => [2, 3, 4].map(column => ({ row, column }))),
        ...[2, 3].reverse().flatMap(row => [3].map(column => ({ row, column }))),
      ],
    },
  ].map(rest => ({
    comboDescriptors: [
      { modifier: '', arrow: 'ArrowUp', combo: 'shift+up' },
    ],
    ...rest,
  })),

  // SHIFT+LEFT
  ...[
    {
      initialFocusedDescription: 'bottom left of superselected',
      initialFocused: { row: 4, column: 2 },
      expectedFocusedDescription: 'previous eligible in row',
      expectedFocused: { row: 4, column: 1 },
      expectedSelectedDescription: 'an expansion of the current selection (i.e. all currently selected cells, plus all eligible cells in the previous eligible column AND within superselected row bounds (selecting from top to bottom and right to left))',
      expectedSelected: [
        ...[2, 3, 4].flatMap(row => [2, 3, 4].map(column => ({ row, column }))),
        ...[1].flatMap(column => [2, 3, 4].map(row => ({ row, column }))),
      ],
    },
    {
      initialFocusedDescription: 'top left of superselected',
      initialFocused: { row: 2, column: 2 },
      expectedFocusedDescription: 'previous eligible in row',
      expectedFocused: { row: 2, column: 1 },
      expectedSelectedDescription: 'an expansion of the current selection (i.e. all currently selected cells, plus all eligible cells in the previous eligible column AND within superselected row bounds (selecting from bottom to top and right to left))',
      expectedSelected: [
        ...[2, 3, 4].flatMap(row => [2, 3, 4].map(column => ({ row, column }))),
        ...[1].flatMap(column => [2, 3, 4].reverse().map(row => ({ row, column }))),
      ],
    },
    {
      initialFocusedDescription: 'bottom right of superselected',
      initialFocused: { row: 4, column: 4 },
      expectedFocusedDescription: 'previous eligible in row',
      expectedFocused: { row: 4, column: 3 },
      expectedSelectedDescription: 'a contraction of the current selection (i.e. all currently selected cells, minus the focused cell and all eligible cells in the focused column)',
      expectedSelected: [
        ...[2, 3, 4].flatMap(row => [2, 3].map(column => ({ row, column }))),
      ],
    },
    {
      initialFocusedDescription: 'top right of superselected',
      initialFocused: { row: 2, column: 4 },
      expectedFocusedDescription: 'previous eligible in row',
      expectedFocused: { row: 2, column: 3 },
      expectedSelectedDescription: 'a contraction of the current selection (i.e. all currently selected cells, minus the focused cell and all eligible cells in the focused column)',
      expectedSelected: [
        ...[2, 3, 4].flatMap(row => [2, 3].map(column => ({ row, column }))),
      ],
    },
    {
      initialFocusedDescription: 'inside superselected bounds',
      initialFocused: { row: 3, column: 3 },
      expectedFocusedDescription: 'previous eligible in row',
      expectedFocused: { row: 3, column: 2 },
      expectedSelectedDescription: 'a single-row expansion of the current selection (i.e. all currently selected cells, plus the focused cell, plus the previous eligible cell in the focused row)',
      expectedSelected: [
        ...[2, 3, 4].flatMap(row => [2, 3, 4].map(column => ({ row, column }))),
        ...[2, 3].reverse().flatMap(column => [3].map(row => ({ row, column }))),
      ],
    },
  ].map(rest => ({
    comboDescriptors: [
      { modifier: '', arrow: 'ArrowLeft', combo: 'shift+left' },
    ],
    ...rest,
  })),

  // SHIFT+DOWN
  ...[
    {
      initialFocusedDescription: 'bottom right of superselected',
      initialFocused: { row: 4, column: 4 },
      expectedFocusedDescription: 'next eligible in column',
      expectedFocused: { row: 5, column: 4 },
      expectedSelectedDescription: 'an expansion of the current selection (i.e. all currently selected cells, plus all eligible cells in the next eligible row AND within superselected column bounds (selecting from top to bottom and left to right))',
      expectedSelected: [
        ...[2, 3, 4].flatMap(row => [2, 3, 4].map(column => ({ row, column }))),
        ...[5].flatMap(row => [2, 3, 4].map(column => ({ row, column }))),
      ],
    },
    {
      initialFocusedDescription: 'bottom left of superselected',
      initialFocused: { row: 4, column: 2 },
      expectedFocusedDescription: 'next eligible in column',
      expectedFocused: { row: 5, column: 2 },
      expectedSelectedDescription: 'an expansion of the current selection (i.e. all currently selected cells, plus all eligible cells in the next eligible row AND within superselected column bounds (selecting from top to bottom and right to left))',
      expectedSelected: [
        ...[2, 3, 4].flatMap(row => [2, 3, 4].map(column => ({ row, column }))),
        ...[5].flatMap(row => [2, 3, 4].reverse().map(column => ({ row, column }))),
      ],
    },
    {
      initialFocusedDescription: 'top right of superselected',
      initialFocused: { row: 2, column: 4 },
      expectedFocusedDescription: 'next eligible in column',
      expectedFocused: { row: 3, column: 4 },
      expectedSelectedDescription: 'a contraction of the current selection (i.e. all currently selected cells, minus the focused cell and all eligible cells in the focused row)',
      expectedSelected: [
        ...[3, 4].flatMap(row => [2, 3, 4].map(column => ({ row, column }))),
      ],
    },
    {
      initialFocusedDescription: 'top left of superselected',
      initialFocused: { row: 2, column: 2 },
      expectedFocusedDescription: 'next eligible in column',
      expectedFocused: { row: 3, column: 2 },
      expectedSelectedDescription: 'a contraction of the current selection (i.e. all currently selected cells, minus the focused cell and all eligible cells in the focused row)',
      expectedSelected: [
        ...[3, 4].flatMap(row => [2, 3, 4].map(column => ({ row, column }))),
      ],
    },
    {
      initialFocusedDescription: 'inside superselected bounds',
      initialFocused: { row: 3, column: 3 },
      expectedFocusedDescription: 'next eligible in column',
      expectedFocused: { row: 4, column: 3 },
      expectedSelectedDescription: 'a single-column expansion of the current selection (i.e. all currently selected cells, plus the focused cell, plus the next eligible cell in the focused column)',
      expectedSelected: [
        ...[2, 3, 4].flatMap(row => [2, 3, 4].map(column => ({ row, column }))),
        ...[3, 4].flatMap(row => [3].map(column => ({ row, column }))),
      ],
    },
  ].map(rest => ({
    comboDescriptors: [
      { modifier: '', arrow: 'ArrowDown', combo: 'shift+down' },
    ],
    ...rest,
  })),

  // SHIFT+RIGHT
  ...[
    {
      initialFocusedDescription: 'top right of superselected',
      initialFocused: { row: 2, column: 4 },
      expectedFocusedDescription: 'next eligible in column',
      expectedFocused: { row: 2, column: 5 },
      expectedSelectedDescription: 'an expansion of the current selection (i.e. all currently selected cells, plus all eligible cells in the next eligible column AND within superselected row bounds (selecting from bottom to top and left to right))',
      expectedSelected: [
        ...[2, 3, 4].flatMap(row => [2, 3, 4].map(column => ({ row, column }))),
        ...[5].flatMap(column => [2, 3, 4].reverse().map(row => ({ row, column }))),
      ],
    },
    {
      initialFocusedDescription: 'bottom right of superselected',
      initialFocused: { row: 4, column: 4 },
      expectedFocusedDescription: 'next eligible in column',
      expectedFocused: { row: 4, column: 5 },
      expectedSelectedDescription: 'an expansion of the current selection (i.e. all currently selected cells, plus all eligible cells in the next eligible column AND within superselected row bounds (selecting from top to bottom and left to right))',
      expectedSelected: [
        ...[2, 3, 4].flatMap(row => [2, 3, 4].map(column => ({ row, column }))),
        ...[5].flatMap(column => [2, 3, 4].map(row => ({ row, column }))),
      ],
    },
    {
      initialFocusedDescription: 'top left of superselected',
      initialFocused: { row: 2, column: 2 },
      expectedFocusedDescription: 'next eligible in column',
      expectedFocused: { row: 2, column: 3 },
      expectedSelectedDescription: 'a contraction of the current selection (i.e. all currently selected cells, minus the focused cell and all eligible cells in the focused column)',
      expectedSelected: [
        ...[2, 3, 4].flatMap(row => [3, 4].map(column => ({ row, column }))),
      ],
    },
    {
      initialFocusedDescription: 'bottom left of superselected',
      initialFocused: { row: 4, column: 2 },
      expectedFocusedDescription: 'next eligible in column',
      expectedFocused: { row: 4, column: 3 },
      expectedSelectedDescription: 'a contraction of the current selection (i.e. all currently selected cells, minus the focused cell and all eligible cells in the focused column)',
      expectedSelected: [
        ...[2, 3, 4].flatMap(row => [3, 4].map(column => ({ row, column }))),
      ],
    },
    {
      initialFocusedDescription: 'inside superselected bounds',
      initialFocused: { row: 3, column: 3 },
      expectedFocusedDescription: 'next eligible in column',
      expectedFocused: { row: 3, column: 4 },
      expectedSelectedDescription: 'a single-row expansion of the current selection (i.e. all currently selected cells, plus the focused cell, plus the next eligible cell in the focused row)',
      expectedSelected: [
        ...[2, 3, 4].flatMap(row => [2, 3, 4].map(column => ({ row, column }))),
        ...[3, 4].flatMap(column => [3].map(row => ({ row, column }))),
      ],
    },
  ].map(rest => ({
    comboDescriptors: [
      { modifier: '', arrow: 'ArrowRight', combo: 'shift+right' },
    ],
    ...rest,
  })),
].map(rest => ({
  initialSelected: [2, 3, 4].flatMap(row => [2, 3, 4].map(column => ({ row, column }))),
  expectedSuperselectedDescription: 'the new selection',
  expectedSuperselected: rest.expectedSelected,
  ...rest,
}))) {
  for (const { modifier, arrow, combo } of comboDescriptors) {
    suite(`when focused on ${initialFocusedDescription}, ${combo} focuses ${expectedFocusedDescription}, selects ${expectedSelectedDescription}, and superselects ${expectedSuperselectedDescription}`, async ({ playwright: { page } }) => {
      const options = {
        clears: true,
        initialSelected,
        initialFocused,
        multiselectable: true,
      }
      const url = `http://localhost:5173/usePlaneInteractions${toOptionsParam(options)}`
      await page.goto(url)
      await page.waitForSelector('div', { state: 'attached' })

      await page.evaluate(() => window.testState.grid.focusedElement.value.focus())

      await page.keyboard.down('Shift')
      if (modifier) await page.keyboard.down(modifier)
      await page.keyboard.down(arrow)

      const value = await page.evaluate(() => {
              return [
                window.testState.grid.focused.value,
                window.testState.grid.selected.value,
                window.testState.grid.superselected.value,
              ]
            }),
            expected = [
              expectedFocused,
              expectedSelected,
              expectedSuperselected,
            ]

      await page.keyboard.up('Shift')
      if (modifier) await page.keyboard.up(modifier)
      await page.keyboard.up(arrow)

      assert.equal(value[0], expected[0], `focused ${url}`)
      assert.equal(value[1], expected[1], `selected ${url}`)
      assert.equal(value[2], expected[2], `superselected ${url}`)
    })
  }
}

for (const [modifier, combo] of [
  ['Meta', 'cmd+a'],
  ['Control', 'ctrl+a'],
]) {
  suite(`when multiselectable, ${combo} selects all`, async ({ playwright: { page } }) => {
    const options = {
      clears: true,
      initialSelected: [],
      multiselectable: true,
    }
    const url = `http://localhost:5173/usePlaneInteractions${toOptionsParam(options)}`
    await page.goto(url)
    await page.waitForSelector('div', { state: 'attached' })

    await page.evaluate(() => window.testState.grid.cells.plane.value.get({ row: 0, column: 0 }).focus())

    await page.keyboard.down(modifier)
    await page.keyboard.down('KeyA')

    const value = await page.evaluate(() => [...window.testState.grid.selected.value]),
          expected = [0, 1, 2, 3, 4, 5, 6].flatMap(row => [0, 1, 2, 3, 4, 5, 6].map(column => ({ row, column })))

    await page.keyboard.up(modifier)
    await page.keyboard.up('KeyA')

    assert.equal(value, expected, url)
  })
}

suite.run()
