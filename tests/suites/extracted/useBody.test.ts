import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('useBody')
)

suite('stores document.body in element API', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useBody')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => window.testState.body.element.value === document.body)

  assert.ok(value)
})

suite.run()
