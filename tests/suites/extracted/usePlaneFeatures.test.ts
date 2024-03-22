import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'
import { toOptionsParam } from '../../toParam'

const suite = withPlaywright(
  createSuite('usePlaneFeatures')
)

suite('respects multiselectable option', async ({ playwright: { page } }) => {
  const options = {
    multiselectable: true,
  }
  await page.goto(`http://localhost:5173/usePlaneFeatures${toOptionsParam(options)}`)
  await page.waitForSelector('div', { state: 'attached' })
  
  const value = await page.evaluate(async () => {
          return window.testState.grid.root.element.value.getAttribute('aria-multiselectable')
        }),
        expected = 'true'

  assert.is(value, expected)
})

suite('syncs focused', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/usePlaneFeatures')
  await page.waitForSelector('div', { state: 'attached' })
  
  const value = await page.evaluate(async () => {
          return window.testState.grid.focused.value
        }),
        expected = [0, 0]

  assert.equal(value, expected)
})

suite('syncs is.enabled(...) and is.disabled(...) with meta in a way that allows those functions to be called in the render function', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/usePlaneFeatures')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return window.testState.grid.cells.plane.value.every(row => row.at(-1).classList.contains('cursor-not-allowed'))
            && window.testState.grid.cells.plane.value.at(-1).every(cell => cell.classList.contains('cursor-not-allowed'))
        })

  assert.ok(value)
})

suite('binds aria-disabled to disabled items', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/usePlaneFeatures')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return window.testState.grid.cells.plane.value.every(row => row.at(-1).getAttribute('aria-disabled') === 'true')
            && window.testState.grid.cells.plane.value.at(-1).every(cell => cell.getAttribute('aria-disabled') === 'true')
        })

  assert.ok(value)
})

suite('syncs focusedRow.array with rows and focusedColumn.array with first row', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/usePlaneFeatures')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return (
            window.testState.grid.focusedRow.array.length === window.testState.grid.cells.plane.value.length
            && window.testState.grid.focusedRow.array.length > 0
            && window.testState.grid.focusedColumn.array.length === window.testState.grid.cells.plane.value.at(0).length
            && window.testState.grid.focusedColumn.array.length > 0
          )
        })

  assert.ok(value)
})

suite('focuses initial selected', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/usePlaneFeatures')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return [window.testState.grid.focusedRow.location, window.testState.grid.focusedColumn.location]
        }),
        expected = [0, 0]

  assert.equal(value, expected)
})

suite('focused respects initialSelected coordinates', async ({ playwright: { page } }) => {
  const options = {
    initialSelected: [1, 1],
  }
  await page.goto(`http://localhost:5173/usePlaneFeatures${toOptionsParam(options)}`)
  await page.waitForSelector('div', { state: 'attached' })
  
  const value = await page.evaluate(async () => {
          return [window.testState.grid.focusedRow.location, window.testState.grid.focusedColumn.location]
        }),
        expected = [1, 1]

  assert.equal(value, expected)
})

suite('focuses first when initialSelected is none', async ({ playwright: { page } }) => {
  const options = {
    clears: true,
    initialSelected: 'none',
  }
  await page.goto(`http://localhost:5173/usePlaneFeatures${toOptionsParam(options)}`)
  await page.waitForSelector('div', { state: 'attached' })
  
  const value = await page.evaluate(async () => {
          return [window.testState.grid.focusedRow.location, window.testState.grid.focusedColumn.location]
        }),
        expected = [0, 0]

  assert.equal(value, expected)
})

suite('focuses last when initialSelected is all', async ({ playwright: { page } }) => {
  const options = {
    multiselectable: true,
    initialSelected: 'all',
  }
  await page.goto(`http://localhost:5173/usePlaneFeatures${toOptionsParam(options)}`)
  await page.waitForSelector('div', { state: 'attached' })
  
  const { value, expected } = await page.evaluate(async () => {
          return {
            value: [window.testState.grid.focusedRow.location, window.testState.grid.focusedColumn.location],
            expected: [window.testState.grid.cells.plane.value.length - 1, window.testState.grid.cells.plane.value.at(0).length - 1],
          }
        })

  assert.equal(value, expected)
})

suite('focuses last initialSelected when array of coordinates', async ({ playwright: { page } }) => {
  const options = {
    multiselectable: true,
    initialSelected: [[0, 0], [1, 1]],
  }
  await page.goto(`http://localhost:5173/usePlaneFeatures${toOptionsParam(options)}`)
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return [window.testState.grid.focusedRow.location, window.testState.grid.focusedColumn.location]
        }),
        expected = [1, 1]

  assert.equal(value, expected)
})

suite('prevents DOM focus change during initial focused sync', async ({ playwright: { page } }) => {
  const options = {
    multiselectable: true,
    initialSelected: [[0, 1], [1, 1]],
  }
  await page.goto(`http://localhost:5173/usePlaneFeatures${toOptionsParam(options)}`)
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return window.testState.grid.cells.plane.value.every(row => !row.includes(document.activeElement))
        })

  assert.ok(value)
})

suite('non-initial focused change causes DOM focus change', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/usePlaneFeatures')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.grid.focusedRow.navigate(1)
          window.testState.grid.focusedColumn.navigate(1)
          await window.nextTick()
          return window.testState.grid.cells.plane.value.at(1).at(1) === document.activeElement
        })

  assert.ok(value)
})

suite('syncs focused with tabindex on items', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/usePlaneFeatures')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return window.testState.grid.cells.plane.value.at(0).at(0).tabIndex === 0
            && window.testState.grid.cells.plane.value.at(0).slice(1).every(option => option.tabIndex === -1)
            && window.testState.grid.cells.plane.value.slice(1).every(row => row.every(option => option.tabIndex === -1))
        })

  assert.ok(value)
})

suite('non-initial focused change does not cause DOM focus change when receivesFocus is false', async ({ playwright: { page } }) => {
  const options = {
    receivesFocus: false,
  }
  await page.goto(`http://localhost:5173/usePlaneFeatures${toOptionsParam(options)}`)
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.grid.focusedRow.navigate(1)
          window.testState.grid.focusedColumn.navigate(1)
          await window.nextTick()
          return window.testState.grid.cells.plane.value.at(1).at(1) !== document.activeElement
        })

  assert.ok(value)
})

suite('does not bind tabindex when receivesFocus is false', async ({ playwright: { page } }) => {
  const options = {
    receivesFocus: false,
  }
  await page.goto(`http://localhost:5173/usePlaneFeatures${toOptionsParam(options)}`)
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return !window.testState.grid.cells.plane.value.some(columns => columns.some(cell => cell.getAttribute('tabindex')))
        })

  assert.ok(value)
})

suite('search(...) searches candidates, falling back to textContent', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/usePlaneFeatures')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.grid.type('z')
          window.testState.grid.search()
          return window.testState.grid.results.value.reduce((length, columns) => length + columns.filter(({ score }) => score > 0).length, 0)
        }),
        expected = 11

  assert.is(value, expected)
})

suite('focuses next results match', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/usePlaneFeatures')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.grid.type('z')
          window.testState.grid.search()
          await window.nextTick()
          return window.testState.grid.focused.value
        }),
        expected = [16, 0]

  assert.equal(value, expected)
})

suite('types and searches on keydown', async ({ playwright: { page, tab } }) => {
  await page.goto('http://localhost:5173/usePlaneFeatures')
  await page.waitForSelector('span', { state: 'attached' })
  await page.focus('input')
  await tab({ direction: 'forward', total: 1 })

  await page.keyboard.down('z')
  await page.keyboard.up('z')

  const value = await page.evaluate(async () => {
          return window.testState.grid.results.value.reduce((length, columns) => length + columns.filter(({ score }) => score > 0).length, 0)
        }),
        expected = 11

  assert.is(value, expected)
})

suite('respects queryMatchThreshold', async ({ playwright: { page } }) => {
  let value1: number
  {
    const options = {
      queryMatchThreshold: 1,
    }
    await page.goto(`http://localhost:5173/usePlaneFeatures${toOptionsParam(options)}`)
    await page.waitForSelector('span', { state: 'attached' })
  
    const value = await page.evaluate(async () => {
            window.testState.grid.paste('42')
            window.testState.grid.search()
            await window.nextTick()
            return window.testState.grid.focused.value
          }),
          expected = [0, 0]

    value1 = value
  
    assert.equal(value, expected)
  }

  let value2: number
  {
    const options = {
      queryMatchThreshold: 0.5,
    }
    await page.goto(`http://localhost:5173/usePlaneFeatures${toOptionsParam(options)}`)
    await page.waitForSelector('span', { state: 'attached' })
  
    const value = await page.evaluate(async () => {
            window.testState.grid.paste('42')
            window.testState.grid.search()
            await window.nextTick()
            return window.testState.grid.focused.value
          }),
          expected = [3, 0]

    value2 = value
  
    assert.equal(value, expected)
  }

  assert.not.equal(value1, value2)
})

suite('syncs selectedRows.array and selectedColumns.array with rows and columns', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/usePlaneFeatures')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return (
            window.testState.grid.selectedRows.array.length === window.testState.grid.cells.plane.value.length
            && window.testState.grid.selectedRows.array.length > 0
            && window.testState.grid.selectedColumns.array.length === window.testState.grid.cells.plane.value[0].length
            && window.testState.grid.selectedColumns.array.length > 0
          )
        })

  assert.ok(value)
})

suite('syncs selected', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/usePlaneFeatures')
  await page.waitForSelector('div', { state: 'attached' })
  
  const values = await page.evaluate(async () => {
          return window.testState.grid.selected.value
        }),
        expected = [[0, 0]]

  assert.equal(values, expected)
})

suite('selects initial selected', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/usePlaneFeatures')
  await page.waitForSelector('div', { state: 'attached' })

  const values = await page.evaluate(async () => {
          return window.testState.grid.selected.value
        }),
        expected = [[0, 0]]

  assert.equal(values, expected)
})

suite('selected respects initialSelected coordinates', async ({ playwright: { page } }) => {
  const options = {
    initialSelected: [0, 1],
  }
  await page.goto(`http://localhost:5173/usePlaneFeatures${toOptionsParam(options)}`)
  await page.waitForSelector('div', { state: 'attached' })
  
  const values = await page.evaluate(async () => {
          return window.testState.grid.selected.value
        }),
        expected = [[0, 1]]

  assert.equal(values, expected)
})

suite('selected respects initialSelected none', async ({ playwright: { page } }) => {
  const options = {
    clears: true,
    initialSelected: 'none',
  }
  await page.goto(`http://localhost:5173/usePlaneFeatures${toOptionsParam(options)}`)
  await page.waitForSelector('div', { state: 'attached' })
  
  const values = await page.evaluate(async () => {
          return window.testState.grid.selected.value
        }),
        expected = []

  assert.equal(values, expected)
})

suite('selected respects initialSelected array of coordinates when multiselectable', async ({ playwright: { page } }) => {
  const options = {
    multiselectable: true,
    initialSelected: [[0, 1], [1, 1]],
  }
  await page.goto(`http://localhost:5173/usePlaneFeatures${toOptionsParam(options)}`)
  await page.waitForSelector('div', { state: 'attached' })
  
  const values = await page.evaluate(async () => {
          return window.testState.grid.selected.value
        }),
        expected = [[0, 1], [1, 1]]

  assert.equal(values, expected)
})

suite('selected respects initialSelected all when multiselectable', async ({ playwright: { page } }) => {
  const options = {
    multiselectable: true,
    initialSelected: 'all',
  }
  await page.goto(`http://localhost:5173/usePlaneFeatures${toOptionsParam(options)}`)
  await page.waitForSelector('div', { state: 'attached' })
  
  const value = await page.evaluate(async () => {
          return [
            Array.from(new Set(window.testState.grid.selectedRows.picks)).length === window.testState.grid.selectedRows.array.length - 1 // one disabled row
            && Array.from(new Set(window.testState.grid.selectedColumns.picks)).length === window.testState.grid.selectedColumns.array.length - 1] // one disabled column
        })

  assert.ok(value)
})

suite('deselect.exact(...) works with coordinate', async ({ playwright: { page } }) => {
  const options = {
    multiselectable: true,
    initialSelected: [[0, 1], [1, 1]],
  }
  await page.goto(`http://localhost:5173/usePlaneFeatures${toOptionsParam(options)}`)
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.grid.deselect.exact([0, 1])
          await window.nextTick()
          return window.testState.grid.selected.value
        }),
        expected = [[1, 1]]

  assert.equal(value, expected)
})

suite('deselect.exact(...) works with arrays of coordinates', async ({ playwright: { page } }) => {
  const options = {
    multiselectable: true,
    initialSelected: [[0, 0], [0, 1], [1, 0]],
  }
  await page.goto(`http://localhost:5173/usePlaneFeatures${toOptionsParam(options)}`)
  await page.waitForSelector('div', { state: 'attached' })
  
  const value = await page.evaluate(async () => {
          window.testState.grid.deselect.exact([[0, 0], [0, 1]])
          await window.nextTick()
          return window.testState.grid.selected.value
        }),
        expected = [[1, 0]]

  assert.equal(value, expected)
})

suite('deselect.exact(...) does not clear when clears is false', async ({ playwright: { page } }) => {
  const options = {
    clears: false,
    multiselectable: true,
    initialSelected: [[0, 1], [1, 1]],
  }
  await page.goto(`http://localhost:5173/usePlaneFeatures${toOptionsParam(options)}`)
  await page.waitForSelector('div', { state: 'attached' })
  
  const value = await page.evaluate(async () => {
          window.testState.grid.deselect.exact([[0, 1], [1, 1]])
          await window.nextTick()
          return window.testState.grid.selected.value
        }),
        expected = [[0, 1], [1, 1]]

  assert.equal(value, expected)
})

suite('deselect.all(...) clears when clears is true', async ({ playwright: { page } }) => {
  const options = {
    clears: true,
    multiselectable: true,
    initialSelected: [[0, 1], [1, 1]],
  }
  await page.goto(`http://localhost:5173/usePlaneFeatures${toOptionsParam(options)}`)
  await page.waitForSelector('div', { state: 'attached' })
  
  const value = await page.evaluate(async () => {
          window.testState.grid.deselect.all()
          await window.nextTick()
          return window.testState.grid.selected.value
        }),
        expected = []

  assert.equal(value, expected)
})

suite('deselect.all(...) does not clear when clears is false', async ({ playwright: { page } }) => {
  const options = {
    clears: false,
    multiselectable: true,
    initialSelected: [[0, 1], [1, 1]],
  }
  await page.goto(`http://localhost:5173/usePlaneFeatures${toOptionsParam(options)}`)

  await page.waitForSelector('div', { state: 'attached' })
  
  const value = await page.evaluate(async () => {
          window.testState.grid.deselect.all()
          await window.nextTick()
          return window.testState.grid.selected.value
        }),
        expected = [[0, 1], [1, 1]]

  assert.equal(value, expected)
})

suite('respects selectsOnFocus false', async ({ playwright: { page } }) => {
  const options = {
    selectsOnFocus: false,
  }
  await page.goto(`http://localhost:5173/usePlaneFeatures${toOptionsParam(options)}`)
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.grid.focusedRow.navigate(1)
          await window.nextTick()
          return window.testState.grid.selected.value
        }),
        expected = [[0, 0]]

  assert.equal(value, expected)
})

suite('respects selectsOnFocus true', async ({ playwright: { page } }) => {
  const options = {
    selectsOnFocus: true,
  }
  await page.goto(`http://localhost:5173/usePlaneFeatures${toOptionsParam(options)}`)
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.grid.focusedRow.navigate(1)
          await window.nextTick()
          return window.testState.grid.selected.value
        }),
        expected = [[1, 0]]

  assert.equal(value, expected)
})

suite('binds aria-selected to selected items', async ({ playwright: { page } }) => {
  const options = {
    multiselectable: true,
    initialSelected: [[0, 1], [1, 1]],
  }
  await page.goto(`http://localhost:5173/usePlaneFeatures${toOptionsParam(options)}`)
  await page.waitForSelector('div', { state: 'attached' })
  
  const value = await page.evaluate(async () => {
          return window.testState.grid.cells.plane.value.at(0).at(1).getAttribute('aria-selected') === 'true'
            && window.testState.grid.cells.plane.value.at(1).at(1).getAttribute('aria-selected') === 'true'
        })

  assert.ok(value)
})

suite('getStatuses(...) returns statuses', async ({ playwright: { page } }) => {
  const options = {
    multiselectable: true,
    initialSelected: [[0, 1], [1, 1]],
  }
  await page.goto(`http://localhost:5173/usePlaneFeatures${toOptionsParam(options)}`)
  await page.waitForSelector('div', { state: 'attached' })
  
  const value = await page.evaluate(async () => {
          return [
            window.testState.grid.getCellStatuses([0, 1]),
            window.testState.grid.getCellStatuses([1, 1]),
            window.testState.grid.getCellStatuses([window.testState.grid.cells.plane.value.length - 1, window.testState.grid.cells.plane.value.at(0).length - 1]),
          ]
        }),
        expected = [
          ['blurred', 'selected', 'enabled'],
          ['focused', 'selected', 'enabled'],
          ['blurred', 'deselected', 'disabled'],
        ]

  assert.equal(value, expected)
})

// TODO: basic bindings

suite.run()
