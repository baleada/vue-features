import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('createMultiRef')
)

suite('creates multi ref', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/createMultiRef')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () =>
          window.testState.el1.value === window.testState.el2.value
          && window.testState.el1.value !== null
        )

  assert.ok(value)
})

suite.run()
