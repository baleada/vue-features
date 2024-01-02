import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('useHistory')
)

suite('rewrite(...) rewrites history', async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useHistory')
  await page.waitForSelector('div')

  const value = await page.evaluate(async () => {
          window.testState.history.rewrite([0, 1, 2])
          return [...window.testState.history.entries.array]
        }),
        expected = [0, 1, 2]

  assert.equal(value, expected)
})

suite('record(...) records history', async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useHistory')
  await page.waitForSelector('div')

  const value = await page.evaluate(async () => {
          window.testState.history.record(0)
          return [...window.testState.history.entries.array]
        }),
        expected = [0]

  assert.equal(value, expected)
})

suite('entries navigates to last item after array changes', async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useHistory')
  await page.waitForSelector('div')

  const value = await page.evaluate(async () => {
          window.testState.history.entries.array = [0, 1, 2]
          await window.nextTick()
          return window.testState.history.entries.location
        }),
        expected = 2

  assert.is(value, expected)
})

suite.run()
