import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'
import { toOptionsParam } from '../../toOptionsParam'

const suite = withPlaywright(
  createSuite('useListFeatures')
)

suite('syncs is.enabled(...) and is.disabled(...) with meta in a way that allows those functions to be called in the render function', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useListFeatures')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return window.testState.listbox.options.list.value.at(-1).classList.contains('cursor-not-allowed')
        })

  assert.ok(value)
})

suite('binds aria-disabled to disabled items', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useListFeatures')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return window.testState.listbox.options.list.value.at(-1).getAttribute('aria-disabled')
        }),
        expected = 'true'

  assert.is(value, expected)
})

suite('syncs focused.array with list', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useListFeatures')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return window.testState.listbox.focused.array.length === window.testState.listbox.options.list.value.length
            && window.testState.listbox.focused.array.length > 0
        })

  assert.ok(value)
})

suite('focuses initial selected', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useListFeatures')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return window.testState.listbox.focused.location
        }),
        expected = 0

  assert.is(value, expected)
})

suite('focused respects initialSelected number', async ({ playwright: { page } }) => {
  const options = {
    initialSelected: 1,
  }
  await page.goto(`http://localhost:5173/useListFeatures${toOptionsParam(options)}`)
  await page.waitForSelector('div', { state: 'attached' })
  
  const value = await page.evaluate(async () => {
          return window.testState.listbox.focused.location
        }),
        expected = 1

  assert.is(value, expected)
})

suite('focuses first when initialSelected is none', async ({ playwright: { page } }) => {
  const options = {
    clears: true,
    initialSelected: 'none',
  }
  await page.goto(`http://localhost:5173/useListFeatures${toOptionsParam(options)}`)
  await page.waitForSelector('div', { state: 'attached' })
  
  const value = await page.evaluate(async () => {
          return window.testState.listbox.focused.location
        }),
        expected = 0

  assert.is(value, expected)
})

suite('focuses last initialSelected when array of numbers', async ({ playwright: { page } }) => {
  const options = {
    multiselectable: true,
    initialSelected: [1, 2],
  }
  await page.goto(`http://localhost:5173/useListFeatures${toOptionsParam(options)}`)
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return window.testState.listbox.focused.location
        }),
        expected = 2

  assert.is(value, expected)
})

suite('focuses last initialSelected when all', async ({ playwright: { page } }) => {
  const options = {
    multiselectable: true,
    initialSelected: 'all',
  }
  
  await page.goto(`http://localhost:5173/useListFeatures${toOptionsParam(options)}`)
  await page.waitForSelector('div', { state: 'attached' })
  
  const value = await page.evaluate(async () => {
          let lastEnabled
          let index = window.testState.listbox.options.list.value.length - 1
          while (typeof lastEnabled !== 'number' && index >= 0) {
            if (window.testState.listbox.options.list.value.at(index).getAttribute('aria-disabled') !== 'true') {
              lastEnabled = index
            }
            index--
          }

          return window.testState.listbox.focused.location === lastEnabled
        })        

  assert.ok(value)
})

suite('prevents DOM focus change during initial focused sync', async ({ playwright: { page } }) => {
  const options = {
    multiselectable: true,
    initialSelected: [1, 2],
  }
  await page.goto(`http://localhost:5173/useListFeatures${toOptionsParam(options)}`)
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return window.testState.listbox.options.list.value.includes(document.activeElement)
        })

  assert.not.ok(value)
})

suite('non-initial focused change causes DOM focus change', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useListFeatures')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.listbox.focused.navigate(1)
          await window.nextTick()
          return window.testState.listbox.options.list.value.at(1) === document.activeElement
        })

  assert.ok(value)
})

suite('syncs focused with tabindex on items', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useListFeatures')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return window.testState.listbox.options.list.value.at(0).tabIndex === 0
            && window.testState.listbox.options.list.value.slice(1).every(option => option.tabIndex === -1)
        })

  assert.ok(value)
})

suite('non-initial focused change does not cause DOM focus change when transfersFocus is false', async ({ playwright: { page } }) => {
  const options = {
    transfersFocus: false,
  }
  await page.goto(`http://localhost:5173/useListFeatures${toOptionsParam(options)}`)
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.listbox.focused.navigate(1)
          await window.nextTick()
          return window.testState.listbox.options.list.value.at(1) !== document.activeElement
        })

  assert.ok(value)
})

suite('does not bind tabindex when transfersFocus is false', async ({ playwright: { page } }) => {
  const options = {
    transfersFocus: false,
  }
  await page.goto(`http://localhost:5173/useListFeatures${toOptionsParam(options)}`)
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return !window.testState.listbox.options.list.value.some(option => option.getAttribute('tabindex'))
        })

  assert.ok(value)
})

suite('does not select on focus', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useListFeatures')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.listbox.focused.navigate(1)
          await window.nextTick()
          return window.testState.listbox.selected.newest
        }),
        expected = 0

  assert.is(value, expected)
})

suite('respects selectsOnFocus option', async ({ playwright: { page } }) => {
  const options = {
    selectsOnFocus: true,
  }
  await page.goto(`http://localhost:5173/useListFeatures${toOptionsParam(options)}`)
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.listbox.focused.navigate(1)
          await window.nextTick()
          return window.testState.listbox.selected.newest
        }),
        expected = 1

  assert.is(value, expected)
})

suite('syncs selected.array with list', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useListFeatures')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return window.testState.listbox.selected.array.length === window.testState.listbox.options.list.value.length
            && window.testState.listbox.selected.array.length > 0
        })

  assert.ok(value)
})

suite('selects initial selected', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useListFeatures')
  await page.waitForSelector('div', { state: 'attached' })

  const values = await page.evaluate(async () => {
          return window.testState.listbox.selected.newest
        }),
        expected = 0

  assert.is(values, expected)
})

suite('selected respects initialSelected number', async ({ playwright: { page } }) => {
  const options = {
    initialSelected: 1,
  }
  await page.goto(`http://localhost:5173/useListFeatures${toOptionsParam(options)}`)
  await page.waitForSelector('div', { state: 'attached' })
  
  const values = await page.evaluate(async () => {
          return window.testState.listbox.selected.newest
        }),
        expected = 1

  assert.is(values, expected)
})

suite('selected respects initialSelected none', async ({ playwright: { page } }) => {
  const options = {
    clears: true,
    initialSelected: 'none',
  }
  await page.goto(`http://localhost:5173/useListFeatures${toOptionsParam(options)}`)
  await page.waitForSelector('div', { state: 'attached' })
  
  const values = await page.evaluate(async () => {
          return window.testState.listbox.selected.picks.length
        }),
        expected = 0

  assert.is(values, expected)
})

suite('selected respects initialSelected array of numbers when multiselectable', async ({ playwright: { page } }) => {
  const options = {
    multiselectable: true,
    initialSelected: [1, 2],
  }
  await page.goto(`http://localhost:5173/useListFeatures${toOptionsParam(options)}`)
  await page.waitForSelector('div', { state: 'attached' })
  
  const values = await page.evaluate(async () => {
          return window.testState.listbox.selected.picks.length
        }),
        expected = 2

  assert.is(values, expected)
})

suite('selected respects initialSelected all when multiselectable', async ({ playwright: { page } }) => {
  const options = {
    multiselectable: true,
    initialSelected: 'all',
  }
  
  await page.goto(`http://localhost:5173/useListFeatures${toOptionsParam(options)}`)
  await page.waitForSelector('div', { state: 'attached' })
  
  const value = await page.evaluate(async () => {
          return window.testState.listbox.selected.picks.length === window.testState.listbox.options.list.value.filter(option => option.getAttribute('aria-disabled') !== 'true').length
        })

  assert.ok(value)
})

suite('binds aria-selected to selected items', async ({ playwright: { page } }) => {
  const options = {
    multiselectable: true,
    initialSelected: [1, 2],
  }
  await page.goto(`http://localhost:5173/useListFeatures${toOptionsParam(options)}`)
  await page.waitForSelector('div', { state: 'attached' })
  
  const value = await page.evaluate(async () => {
          return window.testState.listbox.options.list.value.at(1).getAttribute('aria-selected') === 'true'
            && window.testState.listbox.options.list.value.at(2).getAttribute('aria-selected') === 'true'
        })

  assert.ok(value)
})

suite('getStatuses(...) returns statuses', async ({ playwright: { page } }) => {
  const options = {
    multiselectable: true,
    initialSelected: [1, 2],
  }
  await page.goto(`http://localhost:5173/useListFeatures${toOptionsParam(options)}`)
  await page.waitForSelector('div', { state: 'attached' })
  
  const value = await page.evaluate(async () => {
          return [
            window.testState.listbox.getOptionStatuses(1),
            window.testState.listbox.getOptionStatuses(2),
            window.testState.listbox.getOptionStatuses(window.testState.listbox.options.list.value.length - 1),
          ]
        }),
        expected = [
          ['blurred', 'selected', 'enabled'],
          ['focused', 'selected', 'enabled'],
          ['blurred', 'deselected', 'disabled'],
        ]

  assert.equal(value, expected)
})

suite.run()
