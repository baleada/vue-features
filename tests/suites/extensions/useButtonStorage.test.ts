import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('useButtonStorage')
)

suite('assigns status', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useButtonStorage')
  await page.waitForSelector('button', { state: 'attached' })

  await page.evaluate(async () => window.testState.button.on())

  await page.reload()
  await page.waitForSelector('button', { state: 'attached' })

  const value = await page.evaluate(async () => {
          await window.nextTick()

          return window.testState.button.status.value
        }),
        expected = 'on'

  assert.is(value, expected)
})

suite.run()
