import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('manageScrollAllowance')
)

suite('disallows scroll', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/manageScrollAllowance')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.scrollAllowance.disallow()
          await window.nextTick()
          return getComputedStyle(document.documentElement).overflow
        }),
        expected = 'hidden'

  assert.is(value, expected)
})

suite('disallows scroll until allow has been called the same number of times as disallow', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/manageScrollAllowance')
  await page.waitForSelector('div', { state: 'attached' })

  {
    const value = await page.evaluate(async () => {
            window.testState.scrollAllowance.disallow()
            window.testState.scrollAllowance.disallow()
            window.testState.scrollAllowance.allow()
            await window.nextTick()
            return getComputedStyle(document.documentElement).overflow
          }),
          expected = 'hidden'

    assert.is(value, expected)
  }

  {
    const value = await page.evaluate(async () => {
            window.testState.scrollAllowance.allow()
            await window.nextTick()
            return getComputedStyle(document.documentElement).overflow
          }),
          expected = 'visible'

    assert.is(value, expected)
  }
})

suite.run()
