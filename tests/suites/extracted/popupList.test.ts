import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('popupCombo')
)

suite('', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/')
  await page.waitForSelector('', { state: 'attached' })

  const value = await page.evaluate(async () => {
          
        }),
        expected = ''

  assert.is(value, expected)
})

suite.run()
