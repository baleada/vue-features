import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('useSelect')
)

suite('open() works', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useSelect/withUrlOptions')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
    window.testState.select.listbox.open()
    await window.nextTick()
    return window.testState.select.listbox.popupStatus.value
  })

  assert.is(value, 'opened')
})

suite('close() works', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useSelect/withUrlOptions')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
    window.testState.select.listbox.open()
    await window.nextTick()
    window.testState.select.listbox.close()
    await window.nextTick()
    return window.testState.select.listbox.popupStatus.value
  })

  assert.is(value, 'closed')
})

suite('button interactions open listbox', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useSelect/withUrlOptions')
  await page.waitForSelector('div', { state: 'attached' })

  
  {
    await page.evaluate(() => window.testState.select.button.root.element.value.focus())
    await page.keyboard.press('Enter')

    const value = await page.evaluate(() => window.testState.select.listbox.popupStatus.value),
          expected = 'opened'

    assert.is(value, expected)
  }

  await page.evaluate(() => window.testState.select.listbox.close())
})

suite('focuses focused listbox option when opened', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useSelect/withUrlOptions')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.select.listbox.open()
          await window.nextTick()
          await window.nextTick()
          return window.testState.select.listbox.options.list.value.findIndex(el => el === document.activeElement)
        }),
        expected = 0

  assert.is(value, expected)
})

suite.run()
