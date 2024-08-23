import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('toValidityBindValues')
)

suite('binds disabled props to elements', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/toValidityBindValues/element')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(() => ({
          ariaInvalid: window.testState.api.element.value.getAttribute('aria-invalid'),
        })),
        expected = {
          ariaInvalid: 'true',
        }

  assert.equal(value, expected)
})

suite('binds reactive disabled props to elements', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/toValidityBindValues/elementReactive')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(() => ({
          ariaInvalid: window.testState.api.element.value.getAttribute('aria-invalid'),
        })),
        expected = {
          ariaInvalid: 'true',
        }

  assert.equal(value, expected)
})

suite.run()
