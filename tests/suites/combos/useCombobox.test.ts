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

suite.run()
