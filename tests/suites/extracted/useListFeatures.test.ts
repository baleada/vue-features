import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'
import { toOptionsParam } from '../../toParam'

const suite = withPlaywright(
  createSuite('useListFeatures')
)

suite('binds aria-orientation', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useListFeatures')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return window.testState.listbox.root.element.value.getAttribute('aria-orientation')
        }),
        expected = 'vertical'

  assert.is(value, expected)
})

suite('respects orientation option', async ({ playwright: { page } }) => {
  const options = {
    orientation: 'horizontal',
  }
  const url = `http://localhost:5173/useListFeatures${toOptionsParam(options)}`
  await page.goto(url)
  await page.waitForSelector('div', { state: 'attached' })
  
  const value = await page.evaluate(async () => {
          return window.testState.listbox.root.element.value.getAttribute('aria-orientation')
        }),
        expected = 'horizontal'

  assert.is(value, expected, url)
})

suite('respects multiselectable option', async ({ playwright: { page } }) => {
  const options = {
    multiselectable: true,
  }
  const url = `http://localhost:5173/useListFeatures${toOptionsParam(options)}`
  await page.goto(url)
  await page.waitForSelector('div', { state: 'attached' })
  
  const value = await page.evaluate(async () => {
          return window.testState.listbox.root.element.value.getAttribute('aria-multiselectable')
        }),
        expected = 'true'

  assert.is(value, expected, url)
})

suite('respects needsAriaOwns option', async ({ playwright: { page } }) => {
  const options = {
    needsAriaOwns: true,
  }
  const url = `http://localhost:5173/useListFeatures${toOptionsParam(options)}`
  await page.goto(url)
  await page.waitForSelector('div', { state: 'attached' })
  
  const value = await page.evaluate(async () => {
          return [
            window.testState.listbox.root.element.value.getAttribute('aria-owns').split(' ').length,
            window.testState.listbox.options.list.value.length,
          ]
        })

  assert.ok(value[0] > 0 && value[0] === value[1])
})

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

suite('focusing sets status to focusing', async ({ playwright: { page } }) => {
  const options = {
    initialStatus: 'selecting',
  }
  const url = `http://localhost:5173/useListFeatures${toOptionsParam(options)}`
  await page.goto(url)
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.listbox.focusing()
          return window.testState.listbox.status.value
        }),
        expected = 'focusing'

  assert.is(value, expected, url)
})

suite('selecting sets status to selecting', async ({ playwright: { page } }) => {
  const options = {
    initialStatus: 'focusing',
  }
  const url = `http://localhost:5173/useListFeatures${toOptionsParam(options)}`
  await page.goto(url)
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.listbox.selecting()
          return window.testState.listbox.status.value
        }),
        expected = 'selecting'

  assert.is(value, expected, url)
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

suite('respects initialFocused option', async ({ playwright: { page } }) => {
  const options = {
    initialFocused: 1,
  }
  const url = `http://localhost:5173/useListFeatures${toOptionsParam(options)}`
  await page.goto(url)
  await page.waitForSelector('div', { state: 'attached' })
  
  const value = await page.evaluate(async () => {
          return window.testState.listbox.focused.location
        }),
        expected = 1

  assert.is(value, expected, url)
})

suite('focuses initial selected when no initialFocused', async ({ playwright: { page } }) => {
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
  const url = `http://localhost:5173/useListFeatures${toOptionsParam(options)}`
  await page.goto(url)
  await page.waitForSelector('div', { state: 'attached' })
  
  const value = await page.evaluate(async () => {
          return window.testState.listbox.focused.location
        }),
        expected = 1

  assert.is(value, expected, url)
})

suite('focuses first when initialSelected is none', async ({ playwright: { page } }) => {
  const options = {
    clears: true,
    initialSelected: 'none',
  }
  const url = `http://localhost:5173/useListFeatures${toOptionsParam(options)}`
  await page.goto(url)
  await page.waitForSelector('div', { state: 'attached' })
  
  const value = await page.evaluate(async () => {
          return window.testState.listbox.focused.location
        }),
        expected = 0

  assert.is(value, expected, url)
})

suite('focuses last when initialSelected is all', async ({ playwright: { page } }) => {
  const options = {
    initialSelected: 'all',
  }
  
  const url = `http://localhost:5173/useListFeatures${toOptionsParam(options)}`
  await page.goto(url)
  await page.waitForSelector('div', { state: 'attached' })
  
  const value = await page.evaluate(async () => {
          return window.testState.listbox.focused.location
        }),
        expected = 6

  assert.is(value, expected, url)
})

suite('focuses last initialSelected when array of numbers', async ({ playwright: { page } }) => {
  const options = {
    multiselectable: true,
    initialSelected: [1, 6],
  }
  const url = `http://localhost:5173/useListFeatures${toOptionsParam(options)}`
  await page.goto(url)
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return window.testState.listbox.focused.location
        }),
        expected = 6

  assert.is(value, expected, url)
})

suite('focuses last initialSelected when all', async ({ playwright: { page } }) => {
  const options = {
    multiselectable: true,
    initialSelected: 'all',
  }
  
  const url = `http://localhost:5173/useListFeatures${toOptionsParam(options)}`
  await page.goto(url)
  await page.waitForSelector('div', { state: 'attached' })
  
  const value = await page.evaluate(async () => {
          return window.testState.listbox.focused.location
        }),
        expected = 6

  assert.is(value, expected, url)
})

suite('prevents DOM focus change during initial focused sync', async ({ playwright: { page } }) => {
  const options = {
    multiselectable: true,
    initialSelected: [1, 2],
  }
  const url = `http://localhost:5173/useListFeatures${toOptionsParam(options)}`
  await page.goto(url)
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return !window.testState.listbox.options.list.value.includes(document.activeElement)
        })

  assert.ok(value)
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

suite('non-initial focused change does not cause DOM focus change when receivesFocus is false', async ({ playwright: { page } }) => {
  const options = {
    receivesFocus: false,
  }
  const url = `http://localhost:5173/useListFeatures${toOptionsParam(options)}`
  await page.goto(url)
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.listbox.focused.navigate(1)
          await window.nextTick()
          return window.testState.listbox.options.list.value.at(1) !== document.activeElement
        })

  assert.ok(value)
})

suite('does not bind tabindex when receivesFocus is false', async ({ playwright: { page } }) => {
  const options = {
    receivesFocus: false,
  }
  const url = `http://localhost:5173/useListFeatures${toOptionsParam(options)}`
  await page.goto(url)
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return !window.testState.listbox.options.list.value.some(option => option.getAttribute('tabindex'))
        })

  assert.ok(value)
})

suite('search(...) searches candidates, falling back to textContent', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useListFeatures')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.listbox.type('s')
          window.testState.listbox.search()
          return window.testState.listbox.results.value.filter(({ score }) => score > 0).length
        }),
        expected = 4

  assert.is(value, expected)
})

suite('focuses next results match', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useListFeatures')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.listbox.type('s')
          window.testState.listbox.search()
          await window.nextTick()
          return window.testState.listbox.focused.location === window.testState.listbox.results.value.findIndex(({ score }) => score > 0)
        })

  assert.ok(value)
})

suite('types and searches on keydown', async ({ playwright: { page, tab } }) => {
  await page.goto('http://localhost:5173/useListFeatures')
  await page.waitForSelector('span', { state: 'attached' })
  await page.focus('input')
  await tab({ direction: 'forward', total: 1 })

  await page.keyboard.down('s')
  await page.keyboard.up('s')

  const value = await page.evaluate(async () => {
          return window.testState.listbox.results.value.filter(({ score }) => score > 0).length
        }),
        expected = 4

  assert.is(value, expected)
})

suite('respects queryMatchThreshold', async ({ playwright: { page } }) => {
  let value1: number
  {
    const options = {
      queryMatchThreshold: 1,
    }
    const url = `http://localhost:5173/useListFeatures${toOptionsParam(options)}`
    await page.goto(url)
    await page.waitForSelector('span', { state: 'attached' })
  
    const value = await page.evaluate(async () => {
            window.testState.listbox.paste('st')
            window.testState.listbox.search()
            await window.nextTick()
            return window.testState.listbox.focused.location
          }),
          expected = 1

    value1 = value
  
    assert.is(value, expected, url)
  }

  let value2: number
  {
    const options = {
      queryMatchThreshold: 0.5,
    }
    const url = `http://localhost:5173/useListFeatures${toOptionsParam(options)}`
    await page.goto(url)
    await page.waitForSelector('span', { state: 'attached' })
  
    const value = await page.evaluate(async () => {
            window.testState.listbox.paste('st')
            window.testState.listbox.search()
            await window.nextTick()
            return window.testState.listbox.focused.location
          }),
          expected = 0

    value2 = value
  
    assert.is(value, expected, url)
  }

  assert.ok(value1 !== value2)
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
  const url = `http://localhost:5173/useListFeatures${toOptionsParam(options)}`
  await page.goto(url)
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
  const url = `http://localhost:5173/useListFeatures${toOptionsParam(options)}`
  await page.goto(url)
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
  const url = `http://localhost:5173/useListFeatures${toOptionsParam(options)}`
  await page.goto(url)
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
  
  const url = `http://localhost:5173/useListFeatures${toOptionsParam(options)}`
  await page.goto(url)
  await page.waitForSelector('div', { state: 'attached' })
  
  const value = await page.evaluate(async () => {
          return window.testState.listbox.selected.picks.length === window.testState.listbox.options.list.value.filter(option => option.getAttribute('aria-disabled') !== 'true').length
        })

  assert.ok(value)
})

suite('deselect.exact(...) works with index', async ({ playwright: { page } }) => {
  const options = {
    multiselectable: true,
    initialSelected: [1, 2],
  }
  const url = `http://localhost:5173/useListFeatures${toOptionsParam(options)}`
  await page.goto(url)
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.listbox.deselect.exact(1)
          await window.nextTick()
          return window.testState.listbox.selected.picks.length
        }),
        expected = 1

  assert.is(value, expected, url)
})

suite('deselect.exact(...) works with arrays of indices', async ({ playwright: { page } }) => {
  const options = {
    multiselectable: true,
    initialSelected: [1, 2],
  }
  const url = `http://localhost:5173/useListFeatures${toOptionsParam(options)}`
  await page.goto(url)
  await page.waitForSelector('div', { state: 'attached' })
  
  const value = await page.evaluate(async () => {
          window.testState.listbox.deselect.exact([1, 2])
          await window.nextTick()
          return window.testState.listbox.selected.picks.length
        }),
        expected = 0

  assert.is(value, expected, url)
})

suite('deselect.exact(...) does not clear when clears is false', async ({ playwright: { page } }) => {
  const options = {
    clears: false,
    multiselectable: true,
    initialSelected: [1, 2],
  }
  const url = `http://localhost:5173/useListFeatures${toOptionsParam(options)}`
  await page.goto(url)
  await page.waitForSelector('div', { state: 'attached' })
  
  const value = await page.evaluate(async () => {
          window.testState.listbox.deselect.exact([1, 2])
          await window.nextTick()
          return window.testState.listbox.selected.picks.length
        }),
        expected = 2

  assert.is(value, expected, url)
})

suite('deselect.all(...) clears when clears is true', async ({ playwright: { page } }) => {
  const options = {
    clears: true,
    multiselectable: true,
    initialSelected: [1, 2],
  }
  const url = `http://localhost:5173/useListFeatures${toOptionsParam(options)}`
  await page.goto(url)
  await page.waitForSelector('div', { state: 'attached' })
  
  const value = await page.evaluate(async () => {
          window.testState.listbox.deselect.all()
          await window.nextTick()
          return window.testState.listbox.selected.picks.length
        }),
        expected = 0

  assert.is(value, expected, url)
})

suite('deselect.all(...) does not clear when clears is false', async ({ playwright: { page } }) => {
  const options = {
    clears: false,
    multiselectable: true,
    initialSelected: [1, 2],
  }
  const url = `http://localhost:5173/useListFeatures${toOptionsParam(options)}`
  await page.goto(url)

  await page.waitForSelector('div', { state: 'attached' })
  
  const value = await page.evaluate(async () => {
          window.testState.listbox.deselect.all()
          await window.nextTick()
          return window.testState.listbox.selected.picks.length
        }),
        expected = 2

  assert.is(value, expected, url)
})

suite('does not sync selected with focused when status is focusing', async ({ playwright: { page } }) => {
  const options = {
    initialStatus: 'focusing',
    initialSelected: 0,
  }
  const url = `http://localhost:5173/useListFeatures${toOptionsParam(options)}`
  await page.goto(url)

  await page.waitForSelector('div', { state: 'attached' })
  
  const value = await page.evaluate(async () => {
          window.testState.listbox.focused.navigate(1)
          await window.nextTick()
          return window.testState.listbox.selected.newest
        }),
        expected = 0

  assert.is(value, expected, url)
})

suite('syncs selected with focused when status is selecting', async ({ playwright: { page } }) => {
  const options = {
    initialStatus: 'selecting',
    initialSelected: 0,
  }
  const url = `http://localhost:5173/useListFeatures${toOptionsParam(options)}`
  await page.goto(url)

  await page.waitForSelector('div', { state: 'attached' })
  
  const value = await page.evaluate(async () => {
          window.testState.listbox.focused.navigate(1)
          await window.nextTick()
          return window.testState.listbox.selected.newest
        }),
        expected = 1

  assert.is(value, expected, url)
})

suite('binds aria-selected to selected items', async ({ playwright: { page } }) => {
  const options = {
    multiselectable: true,
    initialSelected: [1, 2],
  }
  const url = `http://localhost:5173/useListFeatures${toOptionsParam(options)}`
  await page.goto(url)
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
  const url = `http://localhost:5173/useListFeatures${toOptionsParam(options)}`
  await page.goto(url)
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

  assert.equal(value, expected, url)
})

// TODO: basic bindings

suite.run()
