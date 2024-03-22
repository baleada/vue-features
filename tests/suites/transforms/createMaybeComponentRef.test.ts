import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('createMaybeComponentRef')
)

suite('creates component ref', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/createMaybeComponentRef')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => window.testState.el.value.tagName === 'P' && window.testState.component.value.tagName === 'DIV')

  assert.ok(value)
})

suite.run()
