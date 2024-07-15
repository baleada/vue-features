import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'
import { toOptionsParam, toDisabledParam } from '../../toParam'

const suite = withPlaywright(
  createSuite('usePlaneFeatures')
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
    initialFocused: [6, 6],
    expected: [0, 6],
  },
  {
    modifier: 'Control',
    arrow: 'ArrowUp',
    combo: 'ctrl+up',
    expectedDescription: 'first eligible in column',
    initialFocused: [6, 6],
    expected: [0, 6],
  },
  {
    modifier: 'Meta',
    arrow: 'ArrowLeft',
    combo: 'cmd+left',
    expectedDescription: 'first eligible in row',
    initialFocused: [6, 6],
    expected: [6, 0],
  },
  {
    modifier: 'Control',
    arrow: 'ArrowLeft',
    combo: 'ctrl+left',
    expectedDescription: 'first eligible in row',
    initialFocused: [6, 6],
    expected: [6, 0],
  },
  {
    modifier: 'Meta',
    arrow: 'ArrowDown',
    combo: 'cmd+down',
    expectedDescription: 'last eligible in column',
    initialFocused: [0, 0],
    expected: [6, 0],
  },
  {
    modifier: 'Control',
    arrow: 'ArrowDown',
    combo: 'ctrl+down',
    expectedDescription: 'last eligible in column',
    initialFocused: [0, 0],
    expected: [6, 0],
  },
  {
    modifier: 'Meta',
    arrow: 'ArrowRight',
    combo: 'cmd+right',
    expectedDescription: 'last eligible in row',
    initialFocused: [0, 0],
    expected: [0, 6],
  },
  {
    modifier: 'Control',
    arrow: 'ArrowRight',
    combo: 'ctrl+right',
    expectedDescription: 'last eligible in row',
    initialFocused: [0, 0],
    expected: [0, 6],
  },
  {
    modifier: false,
    arrow: 'ArrowUp',
    combo: 'up',
    expectedDescription: 'previous eligible in column',
    initialFocused: [3, 3],
    expected: [2, 3],
  },
  {
    modifier: false,
    arrow: 'ArrowLeft',
    combo: 'left',
    expectedDescription: 'previous eligible in row',
    initialFocused: [3, 3],
    expected: [3, 2],
  },
  {
    modifier: false,
    arrow: 'ArrowDown',
    combo: 'down',
    expectedDescription: 'next eligible in column',
    initialFocused: [3, 3],
    expected: [4, 3],
  },
  {
    modifier: false,
    arrow: 'ArrowRight',
    combo: 'right',
    expectedDescription: 'next eligible in row',
    initialFocused: [3, 3],
    expected: [3, 4],
  },
  {
    modifier: false,
    arrow: 'Home',
    combo: 'home',
    expectedDescription: 'first eligible',
    initialFocused: [6, 6],
    expected: [0, 0],
  },
  {
    modifier: false,
    arrow: 'End',
    combo: 'end',
    expectedDescription: 'last eligible',
    initialFocused: [0, 0],
    expected: [6, 6],
  },
]) {
  suite(`${combo} focuses ${expectedDescription}`, async ({ playwright: { page } }) => {
    const options = {
      clears: true,
      initialSelected: [],
      initialFocused,
      multiselectable: false,
    }
    const url = `http://localhost:5173/usePlaneFeatures${toOptionsParam(options)}`
    await page.goto(url)
    await page.waitForSelector('div', { state: 'attached' })

    await page.evaluate(() => window.testState.grid.cells.plane.value.get(window.testState.grid.focused.value).focus())

    if (typeof modifier === 'string') await page.keyboard.down(modifier)
    await page.keyboard.down(arrow)

    const value = await page.evaluate(() => window.testState.listbox.focused.location)

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
    const url = `http://localhost:5173/usePlaneFeatures${toOptionsParam(options)}`
    await page.goto(url)
    await page.waitForSelector('div', { state: 'attached' })

    await page.evaluate(() => window.testState.grid.cells.plane.value.get(window.testState.grid.focused.value).focus())

    if (typeof modifier === 'string') await page.keyboard.down(modifier)
    await page.keyboard.down(arrow)

    const value = await page.evaluate(() => window.testState.listbox.focused.location)

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
    const url = `http://localhost:5173/usePlaneFeatures${toOptionsParam(options)}${toDisabledParam([expected])}`
    await page.goto(url)
    await page.waitForSelector('div', { state: 'attached' })

    await page.evaluate(() => window.testState.grid.cells.plane.value.get(window.testState.grid.focused.value).focus())

    if (typeof modifier === 'string') await page.keyboard.down(modifier)
    await page.keyboard.down(arrow)

    const value = await page.evaluate(() => [
      window.testState.listbox.focused.location,
      window.testState.listbox.selected.picks.length,
    ])

    if (typeof modifier === 'string') await page.keyboard.up(modifier)
    await page.keyboard.up(arrow)

    assert.equal(value, [expected, 0], url)
  })
}

suite('when clears, esc clears selection', async ({ playwright: { page } }) => {
  const options = {
    clears: true,
    initialSelected: [3],
    multiselectable: false,
  }
  const url = `http://localhost:5173/usePlaneFeatures${toOptionsParam(options)}`
  await page.goto(url)
  await page.waitForSelector('div', { state: 'attached' })

  await page.evaluate(() => window.testState.listbox.options.list.value[3].focus())

  await page.keyboard.down('Escape')

  const value = await page.evaluate(() => window.testState.listbox.selected.picks),
        expected = []

  await page.keyboard.up('Escape')

  assert.equal(value, expected, url)
})

for (const {
  modifier,
  arrow,
  combo,
  expectedFocusedDescription,
  expectedSelectedDescription,
  initialFocused,
  expectedFocused,
  expectedSelected,
} of [
  {
    modifier: 'Meta',
    arrow: 'ArrowUp',
    combo: 'shift+cmd+up',
    expectedFocusedDescription: 'first eligible',
    expectedSelectedDescription: 'all previous',
    initialFocused: [6, 6],
    expectedFocused: 0,
    expectedSelected: [0, 1, 2, 3, 4, 5, 6],
  },
  {
    modifier: 'Control',
    arrow: 'ArrowUp',
    combo: 'shift+ctrl+up',
    expectedFocusedDescription: 'first eligible',
    expectedSelectedDescription: 'all previous',
    initialFocused: [6, 6],
    expectedFocused: 0,
    expectedSelected: [0, 1, 2, 3, 4, 5, 6],
  },
  {
    modifier: 'Meta',
    arrow: 'ArrowLeft',
    combo: 'shift+cmd+left',
    expectedFocusedDescription: 'first eligible',
    expectedSelectedDescription: 'all previous',
    initialFocused: [6, 6],
    expectedFocused: 0,
    expectedSelected: [0, 1, 2, 3, 4, 5, 6],
  },
  {
    modifier: 'Control',
    arrow: 'ArrowLeft',
    combo: 'shift+ctrl+left',
    expectedFocusedDescription: 'first eligible',
    expectedSelectedDescription: 'all previous',
    initialFocused: [6, 6],
    expectedFocused: 0,
    expectedSelected: [0, 1, 2, 3, 4, 5, 6],
  },
  {
    modifier: 'Meta',
    arrow: 'ArrowDown',
    combo: 'shift+cmd+down',
    expectedFocusedDescription: 'last eligible',
    expectedSelectedDescription: 'all following',
    initialFocused: [0, 0],
    expectedFocused: 6,
    expectedSelected: [0, 1, 2, 3, 4, 5, 6],
  },
  {
    modifier: 'Control',
    arrow: 'ArrowDown',
    combo: 'shift+ctrl+down',
    expectedFocusedDescription: 'last eligible',
    expectedSelectedDescription: 'all following',
    initialFocused: [0, 0],
    expectedFocused: 6,
    expectedSelected: [0, 1, 2, 3, 4, 5, 6],
  },
  {
    modifier: 'Meta',
    arrow: 'ArrowRight',
    combo: 'shift+cmd+right',
    expectedFocusedDescription: 'last eligible',
    expectedSelectedDescription: 'all following',
    initialFocused: [0, 0],
    expectedFocused: 6,
    expectedSelected: [0, 1, 2, 3, 4, 5, 6],
  },
  {
    modifier: 'Control',
    arrow: 'ArrowRight',
    combo: 'shift+ctrl+right',
    expectedFocusedDescription: 'last eligible',
    expectedSelectedDescription: 'all following',
    initialFocused: [0, 0],
    expectedFocused: 6,
    expectedSelected: [0, 1, 2, 3, 4, 5, 6],
  },
]) {
  suite(`when multiselectable, ${combo} selects ${expectedSelectedDescription} and focuses ${expectedFocusedDescription}`, async ({ playwright: { page } }) => {
    const options = {
      clears: true,
      initialSelected: [],
      initialFocused,
      multiselectable: true,
    }
    const url = `http://localhost:5173/usePlaneFeatures${toOptionsParam(options)}`
    await page.goto(url)
    await page.waitForSelector('div', { state: 'attached' })

    await page.evaluate(() => window.testState.grid.cells.plane.value.get(window.testState.grid.focused.value).focus())

    await page.keyboard.down('Shift')
    await page.keyboard.down(modifier)
    await page.keyboard.down(arrow)

    const value = await page.evaluate(() => [
            window.testState.listbox.focused.location,
            window.testState.listbox.selected.picks,
            document.activeElement === window.testState.listbox.options.list.value[window.testState.listbox.focused.location],
          ]),
          expected = [
            expectedFocused,
            expectedSelected,
            true,
          ]

    await page.keyboard.up('Shift')
    await page.keyboard.up(modifier)
    await page.keyboard.up(arrow)

    assert.equal(value, expected, url)
  })
}

for (const [arrow, combo] of [
  ['vertical', 'ArrowUp', 'shift+up'],
  ['horizontal', 'ArrowLeft', 'shift+left'],
]) {
  suite(`when multiselectable and next eligible is in selection and previous eligible is in selection, ${combo} moves focus to previous eligible`, async ({ playwright: { page } }) => {
    const options = {
      clears: true,
      initialFocused: 3,
      initialSelected: [2, 3, 4],
      multiselectable: true,
    }
    const url = `http://localhost:5173/usePlaneFeatures${toOptionsParam(options)}`
    await page.goto(url)
    await page.waitForSelector('div', { state: 'attached' })

    await page.evaluate(() => window.testState.grid.cells.plane.value.get(window.testState.grid.focused.value).focus())

    await page.keyboard.down('Shift')
    await page.keyboard.down(arrow)

    const value = await page.evaluate(() => [
            window.testState.listbox.focused.location,
            window.testState.listbox.selected.picks,
          ]),
          expected = [
            2,
            [2, 3, 4],
          ]

    await page.keyboard.up('Shift')
    await page.keyboard.up(arrow)

    assert.equal(value, expected, url)
  })

  suite(`when multiselectable and next eligible is not in selection and previous eligible is in selection, ${combo} deselects current and moves focus to previous eligible`, async ({ playwright: { page } }) => {
    const options = {
      clears: true,
      initialFocused: 3,
      initialSelected: [2, 3],
      multiselectable: true,
    }
    const url = `http://localhost:5173/usePlaneFeatures${toOptionsParam(options)}`
    await page.goto(url)
    await page.waitForSelector('div', { state: 'attached' })

    await page.evaluate(() => window.testState.grid.cells.plane.value.get(window.testState.grid.focused.value).focus())

    await page.keyboard.down('Shift')
    await page.keyboard.down(arrow)

    await page.evaluate(async () => await window.nextTick())

    const value = await page.evaluate(() => [
            window.testState.listbox.focused.location,
            window.testState.listbox.selected.picks,
          ]),
          expected = [
            2,
            [2],
          ]

    await page.keyboard.up('Shift')
    await page.keyboard.up(arrow)

    assert.equal(value, expected, url)
  })

  suite(`when multiselectable and previous eligible is not in selection and current is not in selection, ${combo} selects current and previous and moves focus to previous`, async ({ playwright: { page } }) => {
    const options = {
      clears: true,
      initialFocused: 3,
      initialSelected: [],
      multiselectable: true,
    }
    const url = `http://localhost:5173/usePlaneFeatures${toOptionsParam(options)}`
    await page.goto(url)
    await page.waitForSelector('div', { state: 'attached' })

    await page.evaluate(() => window.testState.grid.cells.plane.value.get(window.testState.grid.focused.value).focus())

    await page.keyboard.down('Shift')
    await page.keyboard.down(arrow)

    const value = await page.evaluate(() => [
            window.testState.listbox.focused.location,
            window.testState.listbox.selected.picks,
          ]),
          expected = [
            2,
            [3, 2],
          ]

    await page.keyboard.up('Shift')
    await page.keyboard.up(arrow)

    assert.equal(value, expected, url)
  })
}

for (const [arrow, combo] of [
  ['vertical', 'ArrowDown', 'shift+down'],
  ['horizontal', 'ArrowRight', 'shift+right'],
]) {
  suite(`when multiselectable and previous eligible is in selection and next eligible is in selection, ${combo} moves focus to next eligible`, async ({ playwright: { page } }) => {
    const options = {
      clears: true,
      initialFocused: 3,
      initialSelected: [2, 3, 4],
      multiselectable: true,
    }
    const url = `http://localhost:5173/usePlaneFeatures${toOptionsParam(options)}`
    await page.goto(url)
    await page.waitForSelector('div', { state: 'attached' })

    await page.evaluate(() => window.testState.grid.cells.plane.value.get(window.testState.grid.focused.value).focus())

    await page.keyboard.down('Shift')
    await page.keyboard.down(arrow)

    const value = await page.evaluate(() => [
            window.testState.listbox.focused.location,
            window.testState.listbox.selected.picks,
          ]),
          expected = [
            4,
            [2, 3, 4],
          ]

    await page.keyboard.up('Shift')
    await page.keyboard.up(arrow)

    assert.equal(value, expected, url)
  })

  suite(`when multiselectable and previous eligible is not in selection and next eligible is in selection, ${combo} deselects current and moves focus to next eligible`, async ({ playwright: { page } }) => {
    const options = {
      clears: true,
      initialFocused: 3,
      initialSelected: [3, 4],
      multiselectable: true,
    }
    const url = `http://localhost:5173/usePlaneFeatures${toOptionsParam(options)}`
    await page.goto(url)
    await page.waitForSelector('div', { state: 'attached' })

    await page.evaluate(() => window.testState.grid.cells.plane.value.get(window.testState.grid.focused.value).focus())

    await page.keyboard.down('Shift')
    await page.keyboard.down(arrow)

    await page.evaluate(async () => await window.nextTick())

    const value = await page.evaluate(() => [
            window.testState.listbox.focused.location,
            window.testState.listbox.selected.picks,
          ]),
          expected = [
            4,
            [4],
          ]

    await page.keyboard.up('Shift')
    await page.keyboard.up(arrow)

    assert.equal(value, expected, url)
  })

  suite(`when multiselectable and next eligible is not in selection and current is not in selection, ${combo} selects current and next and moves focus to next`, async ({ playwright: { page } }) => {
    const options = {
      clears: true,
      initialFocused: 3,
      initialSelected: [],
      multiselectable: true,
    }
    const url = `http://localhost:5173/usePlaneFeatures${toOptionsParam(options)}`
    await page.goto(url)
    await page.waitForSelector('div', { state: 'attached' })

    await page.evaluate(() => window.testState.grid.cells.plane.value.get(window.testState.grid.focused.value).focus())

    await page.keyboard.down('Shift')
    await page.keyboard.down(arrow)

    const value = await page.evaluate(() => [
            window.testState.listbox.focused.location,
            window.testState.listbox.selected.picks,
          ]),
          expected = [
            4,
            [3, 4],
          ]

    await page.keyboard.up('Shift')
    await page.keyboard.up(arrow)

    assert.equal(value, expected, url)
  })
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
    const url = `http://localhost:5173/usePlaneFeatures${toOptionsParam(options)}`
    await page.goto(url)
    await page.waitForSelector('div', { state: 'attached' })

    await page.evaluate(() => window.testState.listbox.options.list.value[0].focus())

    await page.keyboard.down(modifier)
    await page.keyboard.down('KeyA')

    const value = await page.evaluate(() => [...window.testState.listbox.selected.picks]),
          expected = [0, 1, 2, 3, 4, 5, 6]

    await page.keyboard.up(modifier)
    await page.keyboard.up('KeyA')

    assert.equal(value, expected, url)
  })
}

suite.run()
