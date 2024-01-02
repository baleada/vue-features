import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('useHistory')
)

suite('rewrite(...) rewrites history', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useHistory')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.history.rewrite([0, 1, 2])
          return [...window.testState.history.entries.array]
        }),
        expected = [0, 1, 2]

  assert.equal(value, expected)
})

suite('record(...) records history', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useHistory')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.history.record(0)
          return [...window.testState.history.entries.array]
        }),
        expected = [0]

  assert.equal(value, expected)
})

suite('entries navigates to last item after array changes', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useHistory')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.history.entries.array = [0, 1, 2]
          await window.nextTick()
          return window.testState.history.entries.location
        }),
        expected = 2

  assert.is(value, expected)
})

suite.run()
