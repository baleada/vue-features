import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('useSupportsCss')
)

suite('detects CSS feature support', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useSupportsCss')
  await page.waitForSelector('div', { state: 'attached' })

  {
    const value = await page.evaluate(async () => {
            return window.testState.supportsBackgroundColor.value
          }),
          expected = true

    assert.is(value, expected)
  }

  {
    const value = await page.evaluate(async () => {
            return window.testState.supportsFooBar.value
          }),
          expected = false

    assert.is(value, expected)
  }
})

suite.run()
