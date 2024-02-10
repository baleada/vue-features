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

  await (async () => {
    await page.focus('button')
    await page.keyboard.press('Enter')

    const value = await page.evaluate(() => window.testState.menu.bar.popupStatus.value),
          expected = 'opened'

    assert.is(value, expected)
  })()

  await page.evaluate(() => window.testState.menu.bar.close())
})

suite('esc closes bar', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useMenu/withUrlOptions')
  await page.waitForSelector('div', { state: 'attached' })

  await page.evaluate(async () => {
    window.testState.menu.bar.open()
    await window.nextTick()
  })

  await page.keyboard.press('Escape')

  const value = await page.evaluate(() => {
    return window.testState.menu.bar.popupStatus.value
  })

  assert.is(value, 'closed')
})

suite('focuses focused menu item when opened', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useMenu/withUrlOptions')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.menu.bar.open()
          await window.nextTick()
          await window.nextTick()
          return window.testState.menu.bar.items.list.value.findIndex(el => el === document.activeElement)
        }),
        expected = 0

  assert.is(value, expected)
})

suite('focuses has popup by default when closed', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useMenu/withUrlOptions')
  await page.waitForSelector('div', { state: 'attached' })
  await page.focus('button')

  const value = await page.evaluate(async () => {
          window.testState.menu.bar.open()
          await window.nextTick()
          window.testState.menu.bar.close()
          await window.nextTick()
          return document.activeElement.textContent.trim()
        }),
        expected = 'Open menu'

  assert.is(value, expected)
})

suite('closes when focus leaves', async ({ playwright: { page, tab } }) => {
  await page.goto('http://localhost:5173/useMenu/withUrlOptions')
  await page.waitForSelector('div', { state: 'attached' })

  await page.focus('button')
  await page.keyboard.press('Enter')
  await tab({ direction: 'forward', total: 2 })

  const value = await page.evaluate(() => !window.testState.menu.bar.root.element.value.contains(document.activeElement))

  assert.ok(value)
})

suite.run()
