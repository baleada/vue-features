import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('usePopup')
)

suite('open() opens', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/usePopup')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.popup.open()
          await window.nextTick()
          return window.testState.popup.status.value
        }),
        expected = 'opened'

  assert.is(value, expected)
})

suite('close() closes', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/usePopup')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.popup.open()
          await window.nextTick()
          window.testState.popup.close()
          await window.nextTick()
          return window.testState.popup.status.value
        }),
        expected = 'closed'

  assert.is(value, expected)
})

suite('respects initialStatus option', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/usePopup/withOptions')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return window.testState.popup.status.value
        }),
        expected = 'opened'

  assert.is(value, expected)
})

suite('when trapsFocus is true, contains focus when tabbing before first focusable', async ({ playwright: { page, tab } }) => {
  await page.goto('http://localhost:5173/usePopup/withOptions')
  await page.waitForSelector('span', { state: 'attached' })

  await page.focus('input')
  await tab({ direction: 'forward', total: 1 })
  await tab({ direction: 'backward', total: 1 })

  const value = await page.evaluate(() => document.activeElement.textContent)

  assert.is(value, 'third')
})

suite('when trapsFocus is true, contains focus when tabbing past last focusable', async ({ playwright: { page, tab } }) => {
  await page.goto('http://localhost:5173/usePopup/withOptions')
  await page.waitForSelector('span', { state: 'attached' })

  await page.focus('input')
  await tab({ direction: 'forward', total: 4 })

  const value = await page.evaluate(() => document.activeElement.textContent)

  assert.is(value, 'first')
})

suite('when trapsFocus is true, keeps focus in place when clicking outside', async ({ playwright: { page, tab } }) => {
  await page.goto('http://localhost:5173/usePopup/withOptions')
  await page.waitForSelector('span', { state: 'attached' })

  await page.focus('input')
  await tab({ direction: 'forward', total: 1 })
  await page.click('body')

  const value = await page.evaluate(() => document.activeElement.textContent)

  assert.is(value, 'first')
})

suite.run()
