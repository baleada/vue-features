import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'
import { toOptionsParam } from '../../toOptionsParam'

const suite = withPlaywright(
  createSuite('useListWithEvents')
)

for (const [orientation, modifier, arrow, combo] of [
  ['vertical', 'Meta', 'ArrowUp', 'cmd+up'],
  ['vertical', 'Control', 'ArrowUp', 'ctrl+up'],
  ['horizontal', 'Meta', 'ArrowLeft', 'cmd+left'],
  ['horizontal', 'Control', 'ArrowLeft', 'ctrl+left'],
]) {
  suite(`when ${orientation}, ${combo} focuses first focusable`, async ({ playwright: { page } }) => {
    const options = {
      clears: true,
      initialSelected: [],
      orientation,
      multiselectable: false,
    }
    const url = `http://localhost:5173/useListWithEvents${toOptionsParam(options)}`
    await page.goto(url)
    await page.waitForSelector('div', { state: 'attached' })

    await page.evaluate(() => window.testState.listbox.focus.last())
    await page.evaluate(async () => {
      window.testState.listbox.focus.last()
      window.testState.listbox.options.list.value[window.testState.listbox.focused.location].focus()
    })

    await page.keyboard.down(modifier)
    await page.keyboard.down(arrow)

    const value = await page.evaluate(() => window.testState.listbox.focused.location),
          expected = 0

    await page.keyboard.up(modifier)
    await page.keyboard.up(arrow)
    
    assert.equal(value, expected, url)
  })
}

for (const [orientation, modifier, arrow, combo] of [
  ['vertical', 'Meta', 'ArrowDown', 'cmd+down'],
  ['vertical', 'Control', 'ArrowDown', 'ctrl+down'],
  ['horizontal', 'Meta', 'ArrowRight', 'cmd+right'],
  ['horizontal', 'Control', 'ArrowRight', 'ctrl+right'],
]) {
  suite(`when ${orientation}, ${combo} focuses last focusable`, async ({ playwright: { page } }) => {
    const options = {
      clears: true,
      initialSelected: [],
      orientation,
      multiselectable: false,
    }
    const url = `http://localhost:5173/useListWithEvents${toOptionsParam(options)}`
    await page.goto(url)
    await page.waitForSelector('div', { state: 'attached' })

    await page.evaluate(async () => {
      window.testState.listbox.focus.first()
      window.testState.listbox.options.list.value[window.testState.listbox.focused.location].focus()
    })

    await page.keyboard.down(modifier)
    await page.keyboard.down(arrow)

    const value = await page.evaluate(() => window.testState.listbox.focused.location),
          expected = 6

    await page.keyboard.up(modifier)
    await page.keyboard.up(arrow)
    
    assert.equal(value, expected, url)
  })
}

for (const [orientation, arrow, combo] of [
  ['vertical', 'ArrowUp', 'up'],
  ['horizontal', 'ArrowLeft', 'left'],
]) {
  suite(`when ${orientation}, ${combo} focuses previous eligible`, async ({ playwright: { page } }) => {
    const options = {
      clears: true,
      initialSelected: [],
      orientation,
      multiselectable: false,
    }
    const url = `http://localhost:5173/useListWithEvents${toOptionsParam(options)}`
    await page.goto(url)
    await page.waitForSelector('div', { state: 'attached' })

    await page.evaluate(() => window.testState.listbox.focus.last())

    await page.keyboard.down(arrow)

    const value = await page.evaluate(() => window.testState.listbox.focused.location),
          expected = 5

    await page.keyboard.up(arrow)
    
    assert.equal(value, expected, url)
  })
}

for (const [orientation, arrow, combo] of [
  ['vertical', 'ArrowDown', 'down'],
  ['horizontal', 'ArrowRight', 'right'],
]) {
  suite(`when ${orientation}, ${combo} focuses next eligible`, async ({ playwright: { page } }) => {
    const options = {
      clears: true,
      initialSelected: [],
      orientation,
      multiselectable: false,
    }
    const url = `http://localhost:5173/useListWithEvents${toOptionsParam(options)}`
    await page.goto(url)
    await page.waitForSelector('div', { state: 'attached' })

    await page.evaluate(() => {
      window.testState.listbox.focus.first()
      window.testState.listbox.options.list.value[window.testState.listbox.focused.location].focus()
    })

    await page.keyboard.down(arrow)

    const value = await page.evaluate(() => window.testState.listbox.focused.location),
          expected = 1

    await page.keyboard.up(arrow)
    
    assert.equal(value, expected, url)
  })
}

suite('home focuses first focusable', async ({ playwright: { page } }) => {
  const options = {
    clears: true,
    initialSelected: [],
    orientation: 'vertical',
    multiselectable: false,
  }
  const url = `http://localhost:5173/useListWithEvents${toOptionsParam(options)}`
  await page.goto(url)
  await page.waitForSelector('div', { state: 'attached' })

  await page.evaluate(() => window.testState.listbox.focus.last())

  await page.keyboard.down('Home')

  const value = await page.evaluate(() => window.testState.listbox.focused.location),
        expected = 0

  await page.keyboard.up('Home')
  
  assert.equal(value, expected, url)
})

suite('end focuses last focusable', async ({ playwright: { page } }) => {
  const options = {
    clears: true,
    initialSelected: [],
    orientation: 'vertical',
    multiselectable: false,
  }
  const url = `http://localhost:5173/useListWithEvents${toOptionsParam(options)}`
  await page.goto(url)
  await page.waitForSelector('div', { state: 'attached' })

  await page.evaluate(() => {
    window.testState.listbox.focus.first()
    window.testState.listbox.options.list.value[window.testState.listbox.focused.location].focus()
  })

  await page.keyboard.down('End')

  const value = await page.evaluate(() => window.testState.listbox.focused.location),
        expected = 6

  await page.keyboard.up('End')
  
  assert.equal(value, expected, url)
})

suite('when clears, esc clears selection', async ({ playwright: { page } }) => {
  const options = {
    clears: true,
    initialSelected: [3],
    orientation: 'vertical',
    multiselectable: false,
  }
  const url = `http://localhost:5173/useListWithEvents${toOptionsParam(options)}`
  await page.goto(url)
  await page.waitForSelector('div', { state: 'attached' })

  await page.evaluate(() => window.testState.listbox.options.list.value[3].focus())

  await page.keyboard.down('Escape')

  const value = await page.evaluate(() => window.testState.listbox.selected.picks),
        expected = []

  await page.keyboard.up('Escape')

  assert.equal(value, expected, url)
})

for (const [orientation, modifier, arrow, combo] of [
  ['vertical', 'Meta', 'ArrowUp', 'shift+cmd+up'],
  ['vertical', 'Control', 'ArrowUp', 'shift+ctrl+up'],
  ['horizontal', 'Meta', 'ArrowLeft', 'shift+cmd+left'],
  ['horizontal', 'Control', 'ArrowLeft', 'shift+ctrl+left'],
]) {
  suite(`when multiselectable AND ${orientation}, ${combo} selects all previous, and focuses first`, async ({ playwright: { page } }) => {
    const options = {
      clears: true,
      initialSelected: [],
      orientation,
      multiselectable: true,
    }
    const url = `http://localhost:5173/useListWithEvents${toOptionsParam(options)}`
    await page.goto(url)
    await page.waitForSelector('div', { state: 'attached' })

    await page.evaluate(() => window.testState.listbox.focus.exact(3))

    await page.keyboard.down('Shift')
    await page.keyboard.down(modifier)
    await page.keyboard.down(arrow)

    const value = await page.evaluate(() => [
            window.testState.listbox.focused.location,
            window.testState.listbox.selected.picks,
          ]),
          expected = [
            0,
            [0, 1, 2, 3],
          ]

    await page.keyboard.up('Shift')
    await page.keyboard.up(modifier)
    await page.keyboard.up(arrow)

    assert.equal(value, expected, url)
  })
}

for (const [orientation, modifier, arrow, combo] of [
  ['vertical', 'Meta', 'ArrowDown', 'shift+cmd+down'],
  ['vertical', 'Control', 'ArrowDown', 'shift+ctrl+down'],
  ['horizontal', 'Meta', 'ArrowRight', 'shift+cmd+right'],
  ['horizontal', 'Control', 'ArrowRight', 'shift+ctrl+right'],
]) {
  suite(`when multiselectable AND ${orientation}, ${combo} selects all following, and focuses last`, async ({ playwright: { page } }) => {
    const options = {
      clears: true,
      initialSelected: [],
      orientation,
      multiselectable: true,
    }
    const url = `http://localhost:5173/useListWithEvents${toOptionsParam(options)}`
    await page.goto(url)
    await page.waitForSelector('div', { state: 'attached' })

    await page.evaluate(() => window.testState.listbox.focus.exact(2))

    await page.keyboard.down('Shift')
    await page.keyboard.down(modifier)
    await page.keyboard.down(arrow)

    const value = await page.evaluate(() => [
            window.testState.listbox.focused.location,
            window.testState.listbox.selected.picks,
          ]),
          expected = [
            5,
            [2, 3, 4, 5],
          ]

    await page.keyboard.up('Shift')
    await page.keyboard.up(modifier)
    await page.keyboard.up(arrow)

    assert.equal(value, expected, url)
  })
}

for (const [orientation, arrow, combo] of [
  ['vertical', 'ArrowUp', 'shift+up'],
  ['horizontal', 'ArrowLeft', 'shift+left'],
]) {
  suite(`when multiselectable AND ${orientation} AND next eligible is in selection AND previous eligible is in selection, ${combo} moves focus to previous eligible`, async ({ playwright: { page } }) => {
    const options = {
      clears: true,
      initialSelected: [2, 3, 4],
      orientation,
      multiselectable: true,
    }
    const url = `http://localhost:5173/useListWithEvents${toOptionsParam(options)}`
    await page.goto(url)
    await page.waitForSelector('div', { state: 'attached' })

    await page.evaluate(() => window.testState.listbox.options.list.value[3].focus())

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

  suite(`when multiselectable AND ${orientation} AND next eligible is not in selection AND previous eligible is in selection, ${combo} deselects current AND moves focus to previous eligible`, async ({ playwright: { page } }) => {
    const options = {
      clears: true,
      initialSelected: [2, 3],
      orientation,
      multiselectable: true,
    }
    const url = `http://localhost:5173/useListWithEvents${toOptionsParam(options)}`
    await page.goto(url)
    await page.waitForSelector('div', { state: 'attached' })

    await page.evaluate(() => window.testState.listbox.options.list.value[3].focus())

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

  suite(`when multiselectable AND ${orientation} AND previous eligible is not in selection, ${combo} selects previous and moves focus to furthest consecutive previous eligible (this test has no consecutive previous eligibles)`, async ({ playwright: { page } }) => {
    const options = {
      clears: true,
      initialSelected: [3],
      orientation,
      multiselectable: true,
    }
    const url = `http://localhost:5173/useListWithEvents${toOptionsParam(options)}`
    await page.goto(url)
    await page.waitForSelector('div', { state: 'attached' })

    await page.evaluate(() => window.testState.listbox.options.list.value[3].focus())

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

  suite(`when multiselectable AND ${orientation} AND previous eligible is not in selection, ${combo} selects previous and moves focus to furthest consecutive previous eligible (this test has consecutive previous eligibles)`, async ({ playwright: { page } }) => {
    const options = {
      clears: true,
      initialSelected: [5, 3, 2, 0],
      orientation,
      multiselectable: true,
    }
    const url = `http://localhost:5173/useListWithEvents${toOptionsParam(options)}`
    await page.goto(url)
    await page.waitForSelector('div', { state: 'attached' })

    await page.evaluate(() => window.testState.listbox.options.list.value[5].focus())

    await page.keyboard.down('Shift')
    await page.keyboard.down(arrow)

    const value = await page.evaluate(() => [
            window.testState.listbox.focused.location,
            window.testState.listbox.selected.picks,
          ]),
          expected = [
            2,
            [5, 3, 2, 0, 4],
          ]

    await page.keyboard.up('Shift')
    await page.keyboard.up(arrow)
    
    assert.equal(value, expected, url)
  })
}

for (const [orientation, arrow, combo] of [
  ['vertical', 'ArrowDown', 'shift+down'],
  ['horizontal', 'ArrowRight', 'shift+right'],
]) {
  suite(`when multiselectable AND ${orientation} AND previous eligible is in selection AND next eligible is in selection, ${combo} moves focus to next eligible`, async ({ playwright: { page } }) => {
    const options = {
      clears: true,
      initialSelected: [2, 3, 4],
      orientation,
      multiselectable: true,
    }
    const url = `http://localhost:5173/useListWithEvents${toOptionsParam(options)}`
    await page.goto(url)
    await page.waitForSelector('div', { state: 'attached' })

    await page.evaluate(() => window.testState.listbox.options.list.value[3].focus())

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

  suite(`when multiselectable AND ${orientation} AND previous eligible is not in selection AND next eligible is in selection, ${combo} deselects current AND moves focus to next eligible`, async ({ playwright: { page } }) => {
    const options = {
      clears: true,
      initialSelected: [3, 4],
      orientation,
      multiselectable: true,
    }
    const url = `http://localhost:5173/useListWithEvents${toOptionsParam(options)}`
    await page.goto(url)
    await page.waitForSelector('div', { state: 'attached' })

    await page.evaluate(() => window.testState.listbox.options.list.value[3].focus())

    await page.keyboard.down('Shift')
    await page.keyboard.down(arrow)

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

  suite(`when multiselectable AND ${orientation} AND next eligible is not in selection, ${combo} selects next and moves focus to furthest consecutive next eligible (this test has no consecutive next eligibles)`, async ({ playwright: { page } }) => {
    const options = {
      clears: true,
      initialSelected: [3],
      orientation,
      multiselectable: true,
    }
    const url = `http://localhost:5173/useListWithEvents${toOptionsParam(options)}`
    await page.goto(url)
    await page.waitForSelector('div', { state: 'attached' })

    await page.evaluate(() => window.testState.listbox.options.list.value[3].focus())

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

  suite(`when multiselectable AND ${orientation} AND next eligible is not in selection, ${combo} selects next and moves focus to furthest consecutive next eligible (this test has consecutive next eligibles)`, async ({ playwright: { page } }) => {
    const options = {
      clears: true,
      initialSelected: [0, 2, 3, 5],
      orientation,
      multiselectable: true,
    }
    const url = `http://localhost:5173/useListWithEvents${toOptionsParam(options)}`
    await page.goto(url)
    await page.waitForSelector('div', { state: 'attached' })

    await page.evaluate(() => window.testState.listbox.options.list.value[0].focus())

    await page.keyboard.down('Shift')
    await page.keyboard.down(arrow)

    const value = await page.evaluate(() => [
            window.testState.listbox.focused.location,
            window.testState.listbox.selected.picks,
          ]),
          expected = [
            3,
            [0, 2, 3, 5, 1],
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
      orientation: 'vertical',
      multiselectable: true,
    }
    const url = `http://localhost:5173/useListWithEvents${toOptionsParam(options)}`
    await page.goto(url)
    await page.waitForSelector('div', { state: 'attached' })

    await page.evaluate(() => window.testState.listbox.options.list.value[0].focus())

    await page.keyboard.down(modifier)
    await page.keyboard.down('KeyA')

    const value = await page.evaluate(() => [...window.testState.listbox.selected.picks]),
          expected = [0, 1, 2, 3, 4, 5]

    await page.keyboard.up(modifier)
    await page.keyboard.up('KeyA')

    assert.equal(value, expected, url)
  })
}

suite.run()
