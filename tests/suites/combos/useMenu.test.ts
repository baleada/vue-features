import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('useMenu')
)

suite('open() works', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useMenu/withUrlOptions')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
    window.testState.menu.bar.open()
    await window.nextTick()
    return window.testState.menu.bar.popupStatus.value
  })

  assert.is(value, 'opened')
})

suite('close() works', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useMenu/withUrlOptions')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
    window.testState.menu.bar.open()
    await window.nextTick()
    window.testState.menu.bar.close()
    await window.nextTick()
    return window.testState.menu.bar.popupStatus.value
  })

  assert.is(value, 'closed')
})

suite('button interactions open bar', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useMenu/withUrlOptions')
  await page.waitForSelector('div', { state: 'attached' })


  {
    await page.evaluate(() => window.testState.menu.button.root.element.value.focus())
    await page.keyboard.press('Enter')

    const value = await page.evaluate(() => window.testState.menu.bar.popupStatus.value),
          expected = 'opened'

    assert.is(value, expected)
  }

  await page.evaluate(() => window.testState.menu.bar.close())
})

suite('focuses focused menu item when opened', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useMenu/withUrlOptions')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.menu.bar.open()
          await window.nextTick()
          await window.nextTick()
          return window.testState.menu.bar.focusedElement.value === document.activeElement
        }),
        expected = true

  assert.is(value, expected)
})

suite.run()
