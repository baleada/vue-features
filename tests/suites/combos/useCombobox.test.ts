import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('useCombobox')
)

suite('correctly assigns aria roles', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useCombobox/withUrlOptions')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return window.testState.combobox.textbox.root.element.value.getAttribute('role')
        }),
        expected = 'combobox'

  assert.is(value, expected)
})

suite('correctly assigns aria-autocomplete', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useCombobox/withUrlOptions')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return window.testState.combobox.textbox.root.element.value.getAttribute('aria-autocomplete')
        }),
        expected = 'list'

  assert.is(value, expected)
})

suite('correctly assigns aria-activedescendant', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useCombobox/withUrlOptions')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
    window.testState.combobox.listbox.open()
    await window.nextTick()
    return window.testState.combobox.textbox.root.element.value.getAttribute('aria-activedescendant') === window.testState.combobox.listbox.options.ids.value[window.testState.combobox.listbox.focused.location]
  })

  assert.is(value, true)
})

suite('open() works', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useCombobox/withUrlOptions')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
    window.testState.combobox.listbox.open()
    await window.nextTick()
    return window.testState.combobox.listbox.popupStatus.value
  })

  assert.is(value, 'opened')
})

suite('close() works', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useCombobox/withUrlOptions')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
    window.testState.combobox.listbox.open()
    await window.nextTick()
    window.testState.combobox.listbox.close()
    await window.nextTick()
    return window.testState.combobox.listbox.popupStatus.value
  })

  assert.is(value, 'closed')
})

suite('button interactions open listbox', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useCombobox/withUrlOptions')
  await page.waitForSelector('div', { state: 'attached' })

  
  {
    await page.evaluate(() => window.testState.combobox.button.root.element.value.focus())
    await page.keyboard.press('Enter')

    const value = await page.evaluate(() => window.testState.combobox.listbox.popupStatus.value),
          expected = 'opened'

    assert.is(value, expected)
  }
})

suite('programmatic popup opening toggles button', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useCombobox/withUrlOptions')
  await page.waitForSelector('div', { state: 'attached' })

  
  {
    const value = await page.evaluate(async () => {
            window.testState.combobox.listbox.open()
            await window.nextTick()
            return window.testState.combobox.button.status.value
          }),
          expected = 'on'

    assert.is(value, expected)
  }
})

suite('opens when string changes', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useCombobox/withUrlOptions')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.combobox.textbox.text.string = 'a'
          await window.nextTick()
          return window.testState.combobox.listbox.popupStatus.value
        }
      ),
      expected = 'opened'

  assert.is(value, expected)
})

suite('deselects all when textbox string gets emptied', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useCombobox/withUrlOptions')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.combobox.textbox.text.string = 'a'
          await window.nextTick()
          window.testState.combobox.listbox.select.exact(0)
          await window.nextTick()
          const beforeEmpty = window.testState.combobox.listbox.selected.picks.length
          window.testState.combobox.textbox.text.string = ''
          await window.nextTick()
          return [
            beforeEmpty,
            window.testState.combobox.listbox.selected.picks.length,
          ]
        }
      ),
      expected = [1, 0]

  assert.equal(value, expected)
})

suite('enables all when textbox string gets emptied', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useCombobox/withUrlOptions')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
    window.testState.combobox.textbox.text.string = 'a'
    await window.nextTick()
    window.testState.combobox.listbox.select.exact(0)
    await window.nextTick()
    window.testState.combobox.textbox.text.string = ''
    await window.nextTick()
    return window.testState.combobox.listbox.options.meta.value.map(({ ability }) => ability).every(ability => ability === 'enabled')
  })

  assert.ok(value)
})

suite('pastes string and searches when string changes to non-empty', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useCombobox/withUrlOptions')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          const initialResultsLength = window.testState.combobox.listbox.results.value.length
          window.testState.combobox.textbox.text.string = 'a'
          await window.nextTick()
          return [
            initialResultsLength,
            window.testState.combobox.listbox.results.value.length > 0,
          ]
        }
      ),
      expected = [0, true]

  assert.equal(value, expected)
})

suite('complete(...) completes and closes', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useCombobox/withUrlOptions')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.combobox.listbox.open()
          await window.nextTick()
          window.testState.combobox.complete('abc')
          await window.nextTick()
          return [
            window.testState.combobox.textbox.text.string,
            window.testState.combobox.listbox.popupStatus.value,
          ]
        }
      ),
      expected = ['abc', 'closed']

  assert.equal(value, expected)
})

suite('selecting an option completes and closes', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useCombobox/withUrlOptions')
  await page.waitForSelector('div', { state: 'attached' })
  
  const value = await page.evaluate(async () => {
    window.testState.combobox.listbox.open()
    await window.nextTick()
    window.testState.combobox.listbox.select.exact(0)
    // one tick for effect, one tick for close
    await window.nextTick()
    await window.nextTick()
    return [
      window.testState.combobox.textbox.text.string,
      window.testState.combobox.listbox.popupStatus.value,
    ]
  }),
  expected = ['Chancen International', 'closed']

  assert.equal(value, expected)
})

suite('completes with empty string when focusout and no selection', async ({ playwright: { page, tab } }) => {
  await page.goto('http://localhost:5173/useCombobox/withUrlOptions')
  await page.waitForSelector('div', { state: 'attached' })

  await page.evaluate(async () => {
    window.testState.combobox.textbox.root.element.value.focus()
    window.testState.combobox.listbox.open()
    window.testState.combobox.textbox.text.string = 'abc'
  })

  await tab({ direction: 'forward', total: 1 })

  const value = await page.evaluate(async () => {
          return window.testState.combobox.textbox.text.string
        }),
        expected = ''

  assert.is(value, expected)
})

suite('completes with selected option when focusout and selection', async ({ playwright: { page, tab } }) => {
  await page.goto('http://localhost:5173/useCombobox/withUrlOptions')
  await page.waitForSelector('div', { state: 'attached' })

  await page.evaluate(async () => {
    window.testState.combobox.textbox.root.element.value.focus()
    window.testState.combobox.listbox.open()
    await window.nextTick()
    window.testState.combobox.listbox.select.exact(0)
    await window.nextTick()
    await window.nextTick()
    window.testState.combobox.listbox.open()
    window.testState.combobox.textbox.text.string = 'abc'
  })

  await tab({ direction: 'forward', total: 1 })

  const value = await page.evaluate(async () => {
          return window.testState.combobox.textbox.text.string
        }),
        expected = 'Chancen International'

  assert.is(value, expected)
})

suite('completes with an empty string on escape', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useCombobox/withUrlOptions')
  await page.waitForSelector('div', { state: 'attached' })

  await page.evaluate(async () => {
    window.testState.combobox.textbox.root.element.value.focus()
    window.testState.combobox.listbox.open()
    window.testState.combobox.textbox.text.string = 'abc'
  })

  await page.keyboard.press('Escape')

  const value = await page.evaluate(async () => {
          return window.testState.combobox.textbox.text.string
        }),
        expected = ''

  assert.is(value, expected)
})

suite.run()
