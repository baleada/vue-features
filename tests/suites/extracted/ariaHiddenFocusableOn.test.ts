import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('ariaHiddenFocusableOn')
)

suite('when tabbing backwards from the selected item to an unselected item, focuses previous before first list item', async ({ playwright: { page, tab } }) => {
  await page.goto('http://localhost:5173/useTablist/focusability')
  await page.waitForSelector('div', { state: 'attached' })

  await page.evaluate(async () => {
    window.testState.tablist.select.exact(1)
    await window.nextTick()
    window.testState.tablist.panels.list.value[1].querySelector('button').focus()
  })
  await tab({ direction: 'backward', total: 2 })

  const value = await page.evaluate(async () => document.activeElement.id),
        expected = 'previous'

  assert.is(value, expected)
})

suite('when tabbing forwards from the selected item to an unselected item, focuses next after last focusable in list', async ({ playwright: { page, tab } }) => {
  await page.goto('http://localhost:5173/useTablist/focusability')
  await page.waitForSelector('div', { state: 'attached' })

  await page.evaluate(async () => {
    window.testState.tablist.select.exact(1)
    await window.nextTick()
    window.testState.tablist.panels.list.value[1].querySelector('button').focus()
  })
  await tab({ direction: 'forward', total: 1 })

  const value = await page.evaluate(async () => document.activeElement.id),
        expected = 'next'

  assert.is(value, expected)
})

suite('when tabbing from outside the list into an unselected item, focuses first focusable in selected item', async ({ playwright: { page, tab } }) => {
  await page.goto('http://localhost:5173/useTablist/focusability')
  await page.waitForSelector('div', { state: 'attached' })

  await page.evaluate(async () => {
    window.testState.tablist.select.exact(1)
    await window.nextTick()
    window.testState.tablist.panels.list.value[1].querySelector('button').focus()
  })
  await page.focus('#previous')
  await tab({ direction: 'forward', total: 2 })

  const value = await page.evaluate(async () => window.testState.tablist.panels.list.value[1].contains(document.activeElement))

  assert.ok(value)
})

suite.run()
