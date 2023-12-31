import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('usePopup')
)

suite('open() opens', async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/usePopup')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => {
          window.testState.popup.open()
          await window.nextTick()
          return window.testState.popup.status.value
        }),
        expected = 'opened'

  assert.is(value, expected)
})

suite('close() closes', async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/usePopup')
  await page.waitForSelector('span')

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

suite('respects initialStatus option', async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/usePopup/withOptions')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => {
          return window.testState.popup.status.value
        }),
        expected = 'opened'

  assert.is(value, expected)
})

suite.run()
